---
title: 飞享IM × LangGraph Agent：智能客服落地架构方案
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [AI, LangGraph, Agent, 智能客服, 即时通讯]
---

基于飞享IM开源即时通讯系统，结合 LangGraph + Claude 构建的智能客服方案。用户在 IM 客户端与 AI 机器人对话，回答由 RAG 知识库驱动，**流式逐字输出**，体验接近原生对话。

<!--truncate-->

## 整体架构

系统由三个独立模块组成，通过 HTTP + 私有 IM 信令协议衔接：

```
┌─────────────────────────────────────────────────────────────────┐
│                          用户侧                                  │
│  ┌──────────────────────────────────────────────┐              │
│  │  Electron-Vue 客户端  (electron-vue-chat)     │              │
│  │  ・WebSocket 长连接                           │              │
│  │  ・streamingAiHandler  → Vuex appendStreaming │              │
│  │  ・虚拟气泡实时渲染 + 永久消息替换             │              │
│  └──────────────────┬───────────────────────────┘              │
└─────────────────────│───────────────────────────────────────────┘
                      │ WebSocket  (SubSignal: MN / SAI)
┌─────────────────────▼───────────────────────────────────────────┐
│                 飞享IM 服务端 (chat-server-pro)                   │
│                                                                  │
│  push-connector  (链接网关 · tio NIO)                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  SendMessageHandler                                    │    │
│  │    ├─ saveAndPublish()  → 消息持久化 + MN 通知          │    │
│  │    └─ tryForwardToAgent()  →  [异步线程池]              │    │
│  │         ├─ publishSaiEvent(stream_start)               │    │
│  │         ├─ AgentForwarder.stream(question, userId) ────┼──→ HTTP POST /stream
│  │         │    └─ 逐 chunk 回调 → publishSaiEvent(delta) │    │
│  │         └─ publishSaiEvent(stream_done)                │    │
│  │              → saveAndPublish(fullAnswer)              │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                      │ HTTP POST /stream  (SSE)
┌─────────────────────▼───────────────────────────────────────────┐
│                 Python Agent 服务  (python_client)               │
│                                                                  │
│  FastAPI  service.py                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  POST /stream  →  graph.astream_events()                │   │
│  │                                                          │   │
│  │  LangGraph 状态机  (graph.py)                            │   │
│  │                                                          │   │
│  │  [classify] ── off_topic ──→ [reject]  Claude 通用回答  │   │
│  │      │                                                   │   │
│  │  on_topic                                                │   │
│  │      │                                                   │   │
│  │  [retrieve]  BM25 检索 ChromaDB                         │   │
│  │      │                                                   │   │
│  │  [grade_docs]  并发逐块 Claude 评分                      │   │
│  │      │                                                   │   │
│  │   ┌──┴──┐                                                │   │
│  │ 相关   无关                                               │   │
│  │   │      │                                               │   │
│  │ [generate] [fallback]  流式输出                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  知识库：ChromaDB + BAAI/bge-small-zh-v1.5 本地嵌入             │
│  多轮记忆：conversation_store{userid → deque(最近 3 轮)}         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心流程

### 完整时序

```
用户              Vue 客户端           IM 服务端                Python Agent
 │                    │                    │                         │
 │  发送消息给 AI      │                    │                         │
 │  机器人用户 ────────────────────────────▶│                         │
 │                    │                    │ saveAndPublish()         │
 │                    │◀── SubSignal:MN ───│ (消息存库, MN通知)        │
 │                    │                    │                         │
 │                    │                    │ tryForwardToAgent() 异步 │
 │                    │                    │─────────────────────────▶│
 │                    │                    │  publishSaiEvent(start)  │
 │                    │◀── SubSignal:SAI ──│  (创建占位气泡)           │
 │                    │                    │◀── HTTP SSE chunk ───────│
 │                    │                    │  publishSaiEvent(delta)  │
 │                    │◀── SubSignal:SAI ──│  (追加内容渲染)           │
 │                    │        ...         │        ...               │
 │                    │                    │◀── HTTP SSE 结束 ────────│
 │                    │                    │  publishSaiEvent(done)   │
 │                    │◀── SubSignal:SAI ──│  (结束流式状态)           │
 │                    │                    │ saveAndPublish(fullAnswer)│
 │                    │◀── SubSignal:MN ───│ (完整回答存库, MN通知)    │
 │                    │  (拉取并替换气泡)   │                         │
```

### 关键判断逻辑（SendMessageHandler）

```
收到消息
    │
    ├─ 会话类型 ≠ 私聊？ → 跳过
    ├─ 目标用户 ≠ AI机器人？ → 跳过
    ├─ 消息类型 ≠ 文本？ → 跳过
    └─ 提取 searchableContent → 异步转发 Agent
```

原始消息存储和推送**不受影响**，Agent 转发在独立线程池中执行，与消息链路完全解耦。

---

## 关键组件

### 1. Agent 转发层（Java）

`AgentForwarder.java` 提供两个核心方法：

| 方法 | 说明 |
|------|------|
| `ask(question)` | 同步 HTTP POST `/ask`，返回完整答案字符串 |
| `stream(question, userId, tokenConsumer)` | 流式 HTTP POST `/stream`，逐 chunk 回调 Consumer |

`stream()` 使用原始字符流（`reader.read(buf)`）而非 `readLine()`，保留换行符，避免客户端内容挤成一行。

`SendMessageHandler.tryForwardToAgent()` 核心逻辑：

```java
// 发流开始信号 → 客户端创建占位气泡
publisher.publishSaiEvent(fromUser, streamId, "", false, AI_AGENT_USER_ID);

// 逐 chunk 推送
AgentForwarder.stream(question, fromUser, token -> {
    publisher.publishSaiEvent(fromUser, streamId, token, false, AI_AGENT_USER_ID);
});

// 流结束信号 + 完整答案存库
publisher.publishSaiEvent(fromUser, streamId, "", true, AI_AGENT_USER_ID);
saveAndPublish(AI_AGENT_USER_ID, null, replyMessage);
```

### 2. RAG 工作流（Python）

`graph.py` 中的 LangGraph 状态机节点流转：

```
classify  →  使用 Claude 判断是否飞享IM相关（带最近 4 条历史辅助追问识别）
    │
on_topic  →  retrieve：BM25 从 ChromaDB 检索 top-k 文档块
                 │
             grade_docs：并发逐块调用 Claude 评分，过滤无关内容
                 │
           有相关文档 → generate：Claude 基于知识库流式生成（最多 600 tokens）
           无相关文档 → fallback：提示知识库不足，引导访问官网
    │
off_topic →  reject：Claude 直接回答通用问题（最多 8192 tokens）
```

`grade_docs` 节点启用 `thinking={"type": "adaptive"}`，提升文档相关性判断准确率。

### 3. 流式信令处理（Vue 客户端）

`streamingAiHandler.js` 处理 SAI 信令：

```js
processMessage(proto) {
    const { i: streamId, d: delta, f: isDone, t: target } = JSON.parse(proto.content);
    vuexStore.commit('appendStreamingContent', { streamId, delta, isDone, target });
}
```

`store.js` 中 `appendStreamingContent` mutation 的状态流转：

| 事件 | 动作 |
|------|------|
| 首次收到 streamId（`f=false, d=""`） | 创建虚拟消息，插入当前会话 |
| 收到 delta（`f=false, d="token"`） | 追加到虚拟消息，响应式更新 UI |
| 收到结束信号（`f=true`） | 标记 `streaming=false`，加入待替换列表 |
| MN 通知到达 | 拉取永久消息，替换并删除虚拟消息 |

---

## 流式推送协议（SAI 信令）

在 `SubSignal.java` 枚举末尾新增 `SAI`（Streaming AI），不影响现有信令序号。

**Payload 格式（UTF-8 JSON）**：

```json
{
  "i": "uuid-stream-id",
  "d": "回答的 token 片段",
  "f": false,
  "t": "AI_BOT_USER_ID"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `i` | string | 本次流会话唯一 ID，客户端用于关联占位气泡 |
| `d` | string | 本次 chunk 内容，`""` 表示控制帧 |
| `f` | boolean | `true` = 最后一帧，流结束 |
| `t` | string | AI 机器人的 IM 用户 ID，客户端定位会话 |

---

## 会话记忆隔离

Agent 服务按 `userid` 隔离对话历史，保留最近 3 轮（6 条消息）：

```python
conversation_store: dict[str, deque] = {}  # {userid: deque(maxlen=6)}
```

IM 消息路径天然携带发送方 `fromUser`，无需客户端额外传参。多用户并发时，每个 IM 用户拥有独立的对话上下文。

---

## 部署拓扑

```
                    ┌─────────────────────┐
                    │   IM 客户端          │
                    │  (Web / Android)     │
                    └─────────┬───────────┘
                              │ WebSocket / TCP
                    ┌─────────▼───────────┐
                    │  push-connector     │  :9001 (TCP)
                    │  链接网关           │  :8083 (WebSocket)
                    └─────────┬───────────┘
                    ┌─────────▼───────────┐
                    │  push-group         │  Dubbo RPC
                    │  消息 & 业务服务    │
                    └─────────┬───────────┘
              MySQL ──────────┤
           ZooKeeper ─────────┘

          HTTP POST /stream（同机或内网）
                    ┌─────────────────────┐
                    │  Python Agent       │  :8000
                    │  FastAPI + LangGraph│
                    └─────────────────────┘
```

**启动方式**：

```bash
# 1. 启动 IM 服务
docker-compose up -d

# 2. 启动 Python Agent
nohup python3.11 service.py > service.log 2>&1 &

# 3. 健康检查
curl http://localhost:8000/health
# {"status": "ok"}
```

**超时配置**（`AgentForwarder.java`）：

```java
private static final String STREAM_URL = "http://fsharechat.cn:8000/stream";
private static final int CONNECT_TIMEOUT_MS = 5_000;
private static final int READ_TIMEOUT_MS   = 60_000;
```

---

## 扩展方向

**知识库更新**：重新抓取文档后执行 `python ingest.py`，重启 Agent 服务即可加载新知识库。

**多机器人**：在 `tryForwardToAgent()` 中按 `conversationTarget` 路由到不同 Agent 实例，每个实例可维护独立知识库（如售后、技术、商务）。

**群聊客服**：去掉私聊类型判断，检测 @机器人 触发词，回复时指定 `conversationType = Group`。

**限流降级**：线程池满时通过 `RejectedExecutionHandler` 回落到同步 `ask()` 或直接返回"当前咨询量较大，请稍后再试"。
