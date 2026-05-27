---
title: 飞享IM完整架构设计文档——架构师视角的系统设计全解析
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [IM, 即时通讯, 架构设计, 架构师, 分布式, AI融合, 高可用, 技术规范]
---

架构设计不只是画几张图——它是对整个系统的系统性思考：从业务需求到质量约束，从模块拆分到接口契约，从数据分表到故障容灾，再到 AI 融合与技术演进路线。本文以飞享IM（FshareIM）为参考，完整呈现一位架构师在一个生产级 IM 系统上应当完成的全部设计工作，涵盖六大职责分解、五阶段设计步骤，以及覆盖接入层、业务层、数据层、AI 架构、安全架构和部署架构的完整设计文档，附带技术决策记录（ADR）和架构评审检查单。

<!--truncate-->

---

## 一、架构师的工作是什么？

在回答"如何设计这个系统"之前，先明确架构师的职责边界。

### 六大职责与对应工作分解

```
职责 1：规划和设计系统技术及业务架构
  ├── 业务需求深度调研（用户规模、消息量、功能边界）
  ├── 质量属性定义（性能目标、可用性 SLA、安全等级）
  ├── 候选架构方案制定（2-3 套方案对比）
  ├── 架构评估与决策（ADR 记录）
  └── 产出架构设计文档

职责 2：技术平台选型与评估
  ├── 长连接框架（t-io vs Netty vs Undertow）
  ├── 消息队列（Kafka vs RocketMQ vs RabbitMQ）
  ├── 分布式缓存（Hazelcast vs Redis Cluster）
  └── AI 接入方案（本地大模型 vs 云端 API）

职责 3：制定技术接口和规范
  ├── 协议规范：TCP 二进制协议头定义（10 字节固定头）
  ├── API 规范：REST 接口版本策略、错误码体系
  ├── 数据规范：protobuf 字段命名与版本管理
  └── 编码规范：Dubbo 服务接口命名、包结构约定

职责 4：子系统设计与核心代码
  ├── 消息 ID 生成器（类 Snowflake 算法）
  ├── 分布式 Session 管理（Hazelcast + MySQL 双层）
  ├── 消息分表路由（36 张月度分表）
  └── AI 流式输出协议（SAI SubSignal）

职责 5：技术指导与能力培养
  ├── 技术难点文档
  ├── 代码 Review 机制
  └── 新人架构 Onboarding 文档

职责 6：跨团队协作
  ├── 与产品：确定功能优先级与技术可行性
  ├── 与测试：定义性能测试基准与场景
  ├── 与运维：制定容量规划与部署脚本
  └── 与安全：协议加密、鉴权机制
```

### 架构设计五阶段

```
Phase 1: 需求理解（1 周）
  → 功能需求、非功能需求、技术约束、业务约束

Phase 2: 概念架构（3 天）
  → 划分逻辑层次、识别关键组件、制定候选方案

Phase 3: 详细设计（2 周）
  → 模块设计、接口规范、数据库 ER 图、非功能设计

Phase 4: 评审验证（3 天）
  → 架构评审会、POC 验证、压力测试、安全评审

Phase 5: 落地实施（持续）
  → 任务拆分、技术指导、定期架构复盘、文档维护
```

---

## 二、需求分析与约束条件

### 功能性需求

| 功能域 | 子功能 | 优先级 |
|--------|--------|--------|
| 即时消息 | 私聊、群聊消息收发 | P0 |
| 即时消息 | 消息已读/投递回执 | P0 |
| 即时消息 | 消息撤回、@功能 | P1 |
| 用户管理 | 手机号/邮箱注册登录 | P0 |
| 群组管理 | 创建群、加人、踢人 | P0 |
| 多媒体 | 图片、文件发送 | P1 |
| 音视频 | 一对一通话（WebRTC） | P1 |
| **AI 助手** | **AI 对话（流式输出）** | **P1** |
| 多端同步 | Android + Web 消息同步 | P0 |

### 非功能性需求（质量属性目标）

| 质量属性 | 指标 | 当前状态 | 目标 |
|---------|------|---------|------|
| **并发连接数** | 单节点最大连接 | 34 万（8GB 机器） | 110 万（16GB 机器） |
| **消息吞吐量** | 私聊消息 TPS | 3,000–5,000/s | 10,000/s |
| **消息延迟** | P99 端到端延迟 | ~20ms | <50ms |
| **系统可用性** | SLA | 未明确 | 99.95%（月停机 < 22 分钟） |
| **消息可靠性** | 消息不丢失率 | 存在幽灵 Session 丢失风险 | 99.99% |
| **横向扩展** | connector 最大节点数 | 64 | 64（消息 ID 6bit 限制） |

### 技术约束

```
C1: Java 8 运行环境（Proguard 依赖 rt.jar，JDK 9+ 不兼容）
C2: 现有 protobuf 协议需向后兼容（不能破坏已部署客户端）
C3: MySQL 5.7（已有分表策略绑定 36 张月度表）
C4: Docker Compose / Kubernetes 部署（CI/CD 已就绪）
C5: connector 节点最多 64 个（messageId Snowflake 6bit nodeId）
```

---

## 三、系统整体架构设计

### 逻辑架构（4 层分层）

```
┌────────────────────────────────────────────────────────────────────┐
│                          客户端层                                   │
│   ┌───────────────────┐             ┌──────────────────────────┐  │
│   │  Android Client   │             │    Web Client (Vue)       │  │
│   │  (TCP + Protobuf) │             │  (WebSocket + JSON)       │  │
│   └─────────┬─────────┘             └────────────┬─────────────┘  │
└─────────────┼──────────────────────────────────┼──────────────────┘
              │ TCP:6789                           │ WS:6789
┌─────────────┼──────────────────────────────────┼──────────────────┐
│                       接入层（push-connector）                      │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │              t-io 异步 I/O 框架（NIO 长连接管理）             │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐   │  │
│   │  │协议解析器  │ │心跳管理器  │ │限流控制器  │ │AI流式推送   │   │  │
│   │  │(Protobuf)│ │(HeartBeat)│ │(RateLimiter│ │(SAI Signal)│   │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └────────────┘   │  │
│   └────────────────────────────────────────────────────────────┘  │
└─────────────┼──────────────────────────────────────────────────────┘
              │ Dubbo RPC / Kafka
┌─────────────┼──────────────────────────────────────────────────────┐
│                       业务层（push-group）                          │
│   ┌───────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐  │
│   │ 消息服务   │ │  会话管理    │ │  群组管理   │ │  好友管理   │  │
│   └─────┬─────┘ └──────┬──────┘ └─────┬──────┘ └──────┬──────┘  │
│   ┌─────┴──────────────────────────────────────────────┘          │
│   │         缓存层（Hazelcast 内存网格）                             │
│   │  SESSIONS | USER_SESSIONS | MESSAGES_MAP | GROUP_MEMBERS       │
│   └────────────────────────────────────────────────────────────── │
└─────────────┼──────────────────────────────────────────────────────┘
              │ JDBC / REST
┌─────────────┼──────────────────────────────────────────────────────┐
│                         数据层                                      │
│   ┌──────────────────┐ ┌────────────────┐ ┌────────────────────┐  │
│   │  MySQL 5.7        │ │ MinIO 对象存储  │ │  Redis/Redisson    │  │
│   │  (消息/用户/群组)  │ │ (图片/文件)    │ │  (分布式锁/计数)   │  │
│   └──────────────────┘ └────────────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

       HTTP:8081
┌──────────────────────┐
│  REST API（push-api） │  ← 登录/注册/群组管理/文件上传
└──────────────────────┘
```

### 核心消息流转时序

```
Android Client      push-connector       push-group        MySQL/Hazelcast
      │                   │                   │                   │
      │─ sendMsg ─────────▶│                   │                   │
      │                   │─ Dubbo saveAndPublish ──────────────▶ │
      │                   │                   │─ generateId() ───▶│
      │                   │                   │─ storeMessage ───▶│
      │                   │                   │─ insertUserMsgs ──▶│
      │◀── ACK(messageId) ─│◀──────────────────│                   │
      │                   │                   │                   │
      │                   │◀─ publish2Receivers()                 │
      │                   │─ push MN(seq head) ──▶ Web Client     │
      │                   │                        │─ pullMsg ────▶│
      │                   │◀─ push messages ────────│              │
```

---

## 四、模块设计与接口规范

### push-connector 职责边界

```
✓ 维护 TCP/WebSocket 长连接（基于 t-io NIO）
✓ 协议编解码（protobuf 二进制 / JSON）
✓ 心跳检测与连接超时管理
✓ 接入层限流（漏桶算法）
✓ 消息路由：转发给 push-group（Dubbo/Kafka）
✓ AI 流式 token 推送（SAI SubSignal）
✗ 不持久化任何业务数据
✗ 不做消息业务逻辑
```

### push-group 服务层次

```
push-group
├── service/
│   ├── MessageService      ← 消息存取核心
│   ├── SessionService      ← Session CRUD（Hazelcast + MySQL 双写）
│   ├── GroupService        ← 群组 CRUD + 成员管理
│   └── ContactService      ← 好友请求/关系
├── store/
│   ├── MemoryMessagesStore ← Hazelcast 热存储
│   └── DatabaseStore       ← MySQL 冷存储（C3P0 连接池）
├── publisher/
│   └── MessagesPublisher   ← 推送 MN/MRN/SAI 通知
└── dubbo/
    └── DubboConnectorServiceImpl  ← Dubbo RPC 接入点
```

### Dubbo 接口契约（push-stub）

```java
/**
 * push-connector 调用 push-group 的唯一 Dubbo 接口
 * 版本：1.0.0  协议：dubbo
 */
public interface ConnectorServiceApi {

    /**
     * 消息持久化 + 推送（核心 API）
     */
    SendMessageResult saveAndPublish(String fromUser, String clientId,
                                     byte[] message);

    /**
     * 按 seq 拉取消息
     */
    PullMessageResult fetchMessage(String userId, String clientId,
                                   long fromMessageId, int pullType);

    /**
     * 创建/更新会话（连接建立时）
     */
    void createOrUpdateSession(String userId, String clientId, String platform);

    /**
     * 连接断开清理
     */
    void cleanSession(String userId, String clientId);
}
```

### REST API 规范

**通用响应结构：**

```json
{
  "code": 0,
  "message": "ok",
  "data": { },
  "timestamp": 1716800000000
}
```

**错误码体系：**

| 错误码范围 | 含义 |
|-----------|------|
| 0 | 成功 |
| 1xxx | 参数错误 |
| 2xxx | 认证/鉴权错误 |
| 3xxx | 业务逻辑错误 |
| 5xxx | 服务内部错误 |

**核心 API 列表：**

| Method | Path | 描述 |
|--------|------|------|
| POST | `/api/v1/user/login` | 手机号+验证码登录 |
| POST | `/api/v1/user/register` | 注册 |
| POST | `/api/v1/group/create` | 创建群组 |
| POST | `/api/v1/group/{id}/members` | 添加群成员 |
| DELETE | `/api/v1/group/{id}/members/{uid}` | 踢出群成员 |
| POST | `/api/v1/media/upload` | 上传图片/文件到 MinIO |

---

## 五、通信协议设计

### TCP 二进制协议头（10 字节）

```
字节偏移  长度    字段名       描述
─────────────────────────────────────────────────────────
[0]      1 byte  magic        帧同步标志 0xF8（快速校验合法包）
[1]      1 byte  version      协议版本 = 2
[2]      1 byte  signal       主信令类型（Signal 枚举）
[3-6]    4 bytes body_length  消息体长度（大端，最大 2GB）
[7]      1 byte  sub_signal   子信令（SubSignal 枚举）
[8-9]    2 bytes message_id   请求-响应关联 ID（uint16）
─────────────────────────────────────────────────────────
消息体：Protocol Buffers 编码（FSCMessage.proto）
```

### SubSignal 枚举表

| SubSignal | 值 | 用途 |
|-----------|----|------|
| MN | 30 | 消息通知（携带最新 seq，触发客户端拉取） |
| MP | 31 | 消息透传推送（不入离线库） |
| MRN | 49 | 已读/投递回执通知 |
| RMN | 50 | 消息撤回通知 |
| **SAI** | **53** | **AI 流式 token 增量推送（新增）** |
| FRN | 60 | 好友请求通知 |
| GC/GAM/GKM | 70/71/72 | 群创建/加人/踢人通知 |

> **协议兼容性原则：** SubSignal 不能修改已有枚举值；protobuf 字段只能追加，不能修改已有字段编号。

---

## 六、数据架构设计

### 消息分表策略

```
messageId 结构（64 bit）：
  [43bit 时间戳 | 6bit nodeId | 15bit 序号]

分表计算：
  timestamp  = (messageId >> 21) + 2018-01-01
  year_index = year % 3          ← 3 年滚动复用
  month      = month_of_year     ← 0~11
  table      = "t_messages_" + (year_index * 12 + month)

共 36 张表：t_messages_0 ~ t_messages_35

示例（2026 年 5 月消息）：
  2026 % 3 = 0, 月份 = 4 (0-based)
  → t_messages_4
```

**⚠️ 运维注意事项：**
- 时钟回拨可能导致路由到错误分表，需处理（见 ADR-002）
- 跨月查询最多跨 3 张表
- **3 年后同月复用：须在运维计划中安排历史数据归档，否则数据混淆**

### Hazelcast 内存数据结构

| Map 名 | Key | Value | 说明 |
|--------|-----|-------|------|
| SESSIONS | clientID | Session | 连接状态 |
| USER_SESSIONS | userId | Set\<clientId\> | 多设备映射 |
| MESSAGES_MAP | messageId | MessageBundle | 热消息缓存（7 天 TTL） |
| USER_MESSAGES | userId | TreeMap\<seq,msgId\> | 个人收件箱 |
| GROUP_MEMBERS | groupId | Collection\<GroupMember\> | 群成员 |

**⚠️ 架构风险（已发现）：** `SESSIONS` 和 `USER_SESSIONS` 当前无 `max-size` 和 `TTL` 配置，在线用户增至万级时会无界膨胀，导致 OOM。改进方案：

```xml
<map name="sessions">
    <time-to-live-seconds>180</time-to-live-seconds>
    <eviction-policy>LRU</eviction-policy>
    <max-size policy="PER_NODE">500000</max-size>
</map>
```

---

## 七、AI 融合架构设计

> 对应岗位要求第 7 条「**（特别重要）懂 AI，具备新型 AI 架构工程师能力**」

### 当前 AI 接入方案（SAI 协议）

```
用户发消息给 AI 账号（TWTVTVWW）
       │
       ▼
SendMessageHandler.tryForwardToAgent()
       │
       ├── agentExecutor（4 线程异步执行）
       │
       ▼
HTTP POST → AI Agent 服务（http://fsharechat.cn:8000/ask）
       │
       ├── 流开始：publishSaiEvent(delta="", done=false)
       │          → 客户端创建占位消息气泡
       │
       ├── 每个 token：publishSaiEvent(delta=token, done=false)
       │          → SAI SubSignal 直推到客户端
       │
       └── 流结束：publishSaiEvent(delta="", done=true)
                  → saveAndPublish() 完整答案落库
```

### SAI 数据包格式（当前 JSON）

```json
{
  "i": "stream-uuid",   // streamId（流会话 ID）
  "d": "你好",          // token delta（增量内容）
  "f": false,           // done（是否最后一个 chunk）
  "t": "TWTVTVWW"       // AI agent 的 IM userId
}
```

### AI 架构特别关注点

| 关注点 | 当前实现 | 改进建议 |
|-------|---------|---------|
| **流式输出** | SAI SubSignal，每 token 一个包 | 改紧凑二进制帧，减少 JSON 解析开销 |
| **会话记忆隔离** | userId 传给 Agent，按用户维护上下文 | 支持多会话（sessionId）隔离 |
| **并发 AI 请求** | 4 线程固定池，并发 > 4 时排队 | 改有界动态线程池（core=4, max=16） |
| **断线续传** | SAI 不入库，断线丢失 token | 流结束后完整答案通过普通 MN 恢复 |
| **可观测性** | 无 | AI 请求耗时、token 数、错误率监控 |

### AI 架构演进路线

```
当前：单一 HTTP Agent（同步转发，4 线程）
  ↓
Phase 1（短期）：多 Agent 路由
  → 引入 AgentRouter，支持多个 AI 机器人账号

Phase 2（中期）：本地 LLM 接入
  → 引入 Ollama 本地推理，数据不出域
  → 基于 userId+sessionId 的会话记忆隔离

Phase 3（长期）：AI 原生 IM
  → AI 消息优先级调度
  → 多模态支持（图片理解、语音转文字）
  → Agent 工作流编排（LangChain4j 或自研）
```

---

## 八、高可用与容灾设计

### 各层可用性分析

| 服务层 | 当前风险 | 改进方案 |
|--------|---------|---------|
| **接入层（connector）** | 单节点崩溃 → 该节点用户须重连（30~120s） | K8s liveness probe 自动重启 |
| **业务层（push-group）** | **单实例 SPOF** | 部署 2 实例 + Dubbo failover |
| **数据层（MySQL）** | 单主无从库 | MySQL 主从复制 + MHA 自动故障转移 |
| **缓存层（Hazelcast）** | 单节点重启丢 Session | 多节点 Hazelcast 集群 |

### 幽灵 Session 解决方案

**问题：** connector 进程 `kill -9` 时，断线回调不触发，`online=true` 的 Session 残留，其他节点向死连接投递消息后静默丢失。

**解决方案：Hazelcast Entry TTL + 心跳续期**

```java
// 创建 Session 时设置 TTL（心跳间隔 × 2.5）
sessions.put(clientID, session, 150, TimeUnit.SECONDS);

// 每次收到心跳时续期
sessions.setTtl(clientID, 150, TimeUnit.SECONDS);

// 进程崩溃后：150s 后 Hazelcast 自动过期该 Session
// 最坏情况：幽灵 Session 存活 2.5 分钟（可接受）
```

---

## 九、安全架构设计

### 认证流程

```
1. push-api: POST /api/v1/user/login（手机号 + 短信验证码）
2. 返回 token（JWT）
3. push-connector 建立连接后发送 AUTH Signal，携带 token
4. connector → Dubbo → push-group 验证 token 合法性
5. 验证通过：创建 Session，后续消息不再重复鉴权
```

### 传输安全状态

| 通道 | 当前状态 | 生产建议 |
|------|---------|---------|
| TCP 长连接 | 明文 | 启用 SSL（connector 支持配置） |
| WebSocket | ws://（未加密） | 改 wss://（Nginx TLS 终止） |
| REST API | HTTP | HTTPS（Nginx TLS 终止） |
| Dubbo RPC | 明文 + auth token | 内网隔离（已有 token 鉴权） |

### 分布式限流（改进方案）

当前问题：限流计数存在 JVM 内存中，多节点时实际限额 = 配置值 × 节点数。

改进：Redis Lua 滑动窗口分布式限流：

```java
// 发消息：20次/秒；心跳：1次/30秒
String key = "ratelimit:" + userId + ":" + topic;
// Redis ZADD + ZREMRANGEBYSCORE 原子操作
// 所有 connector 节点共享同一计数
```

---

## 十、性能容量规划

### 单节点容量（16GB 机器）

| 指标 | 当前实现 | 优化后目标 |
|------|---------|----------|
| 最大并发连接数 | 110 万（Kernel TCP buffer 瓶颈） | 110 万（需调 tcp_rmem） |
| 消息写入 TPS | 3,000–5,000/s | 10,000/s（Redis INCR 替代分布式锁） |
| MySQL TPS | ~10,000/s（理论） | ~30,000/s（连接池扩容 + 异步写） |
| AI 并发请求 | 4 | 16（线程池扩容） |

### 集群扩容规划

```
目标：支持 1000 万并发连接

connector：10 个节点（16GB 机器）× 110 万 = 1100 万（满足）
push-group：2~4 个实例（Dubbo 负载均衡）
MySQL：主从 + 读写分离（消息分表已就绪）
Redis：Redis Cluster（6 节点，3 主 3 从）
```

### OS 调优清单（运维）

```bash
# 文件描述符上限
echo "* soft nofile 1000000" >> /etc/security/limits.conf
echo "* hard nofile 1000000" >> /etc/security/limits.conf

# TCP 全连接队列
echo 65535 > /proc/sys/net/core/somaxconn

# 减少空闲连接内存
sysctl -w net.ipv4.tcp_rmem="1024 4096 6291456"
sysctl -w net.ipv4.tcp_wmem="1024 4096 4194304"

# JVM 启动参数
-Xmx8g -Xms8g -XX:+UseG1GC -XX:MaxGCPauseMillis=100
-XX:+HeapDumpOnOutOfMemoryError
```

---

## 十一、技术决策记录（ADR）

### ADR-001：选择 t-io 作为 NIO 框架

**背景：** 需要支持 TCP + WebSocket 双协议，同时支撑 100 万级长连接。

| 方案 | 优点 | 缺点 |
|------|------|------|
| **t-io（已选）** | 轻量、对 IM 场景优化、中文文档 | 社区相对较小 |
| Netty | 成熟、社区大、性能极致 | 需编写更多底层代码 |
| WebFlux | Spring 生态整合好 | 不支持自定义 TCP 协议 |

**决策理由：** t-io 内置 IM 场景封装（心跳、群组、广播），开发效率高；110 万连接/节点满足业务需求。**后续评估：** 若需超过 200 万连接/节点，迁移至 Netty。

---

### ADR-002：消息 ID 使用类 Snowflake 算法

**决策：** 43bit 时间戳 + 6bit nodeId + 15bit 序号

```
ID 结构（64 bit）：
┌──────────────────────────────────────────────────────┐
│  timestamp(43bit)  │  nodeId(6bit)  │  rotateId(15bit) │
│  相对 2018-01-01   │  0~63 节点号   │  每毫秒内序号     │
└──────────────────────────────────────────────────────┘
```

**已知风险：**
- 时钟回拨未处理（改进：回拨 > 5ms 拒绝服务，等时钟追上）
- nodeId 手动配置（改进：Redis 自动分配）
- nodeId 上限 63（最多 64 节点）

---

### ADR-003：Hazelcast 作为 Session 存储（部分场景建议改 Redis）

**背景：** 需要分布式 Session 存储，支持多节点查询。

**决策：** Hazelcast IMap 存 Session + MySQL 冷备份

**后续改进方向：**
- `userMessages.lock(user)` 的 Hazelcast 分布式锁 → 迁移至 Redis `INCR` 原子操作
- Session TTL 管理 → 推荐 Redis（原生 TTL 支持更稳定）

---

### ADR-004：AI 流式输出使用新增 SAI SubSignal

**背景：** AI Agent 流式 token 需实时推送，MN → Pull 模式延迟过高（多一个 RTT）。

**决策：** 新增 `SubSignal.SAI`，旁路推送不入离线库；流结束后完整答案通过 `saveAndPublish` 正常落库。

**权衡：** 流中途断线 → token 丢失，仅通过 MN 拉取完整答案恢复（可接受，AI 回复不是核心消息路径）。

---

## 十二、技术演进路线图

```
当前版本（v2.2.x）        近期目标（v2.3.x）       中期目标（v3.0.x）
──────────────────────────────────────────────────────────────────────

接入层：
  单节点 Dubbo 模式    → Kafka 集群模式启用       → Service Mesh
  固定 nodeId 配置     → Redis 自动 nodeId 分配
  JSON 心跳包          → 4 字节二进制心跳

业务层：
  单 push-group 实例   → 2 实例 Dubbo failover    → 微服务拆分
  Hazelcast 分布式锁   → Redis INCR 原子 seq
  同步 MySQL 写        → 异步批量写

数据层：
  MySQL 单主           → 主从复制                 → ShardingSphere 分库分表
  连接池 100           → 连接池 300

AI：
  单 HTTP Agent        → 多 Agent 路由             → 本地 LLM（Ollama）
  4 线程固定池          → 有界动态线程池（4~16）    → LangChain4j 工作流

可观测性：
  日志文件             → ELK Stack                → OpenTelemetry + Jaeger
  无监控               → Prometheus + Grafana
```

---

## 十三、架构评审检查单

> 架构师在每次重大版本发布前须对照评审：

### 功能完整性

- [ ] 所有 P0 功能用例已覆盖（私聊/群聊/登录）
- [ ] 离线消息在断线重连后可完整恢复
- [ ] 多端消息同步（Android + Web）一致
- [ ] AI 流式输出与普通消息互不干扰

### 非功能性验证

- [ ] 压测：单 connector 节点 10 万并发连接稳定 1 小时
- [ ] 压测：消息 TPS 达到目标（5,000+/s）
- [ ] 故障演练：kill -9 connector，客户端 60s 内重连成功
- [ ] 内存泄漏：48 小时运行 Hazelcast 内存无无界增长

### 安全检查

- [ ] AUTH token 验证已开启（不可绕过）
- [ ] Dubbo 服务间鉴权 token 已配置（非空）
- [ ] 生产环境 WebSocket 使用 wss://（TLS）
- [ ] SQL 注入防护（MyBatis 参数绑定，无拼接 SQL）
- [ ] 敏感信息不出现在日志中

### 可运维性

- [ ] 每个服务有健康检查端点（Actuator /health）
- [ ] 关键日志有 traceId（消息 ID 可追踪全链路）
- [ ] JVM 参数已设置 HeapDump（OOM 时自动 dump）
- [ ] 数据库迁移脚本在 Flyway 中管理（有版本号）

### AI 架构专项

- [ ] AI 请求超时已配置（防 Agent 服务慢响应阻塞线程）
- [ ] AI 线程池有界（防 OOM）
- [ ] Agent 服务不可用时有降级（友好提示而非异常）
- [ ] AI 上下文记忆按 userId 隔离（不同用户不串话）

---

## 总结

一个合格的架构师交付物不只是代码，更是：

1. **可演进的分层架构** — 接入层无状态可水平扩展，业务层可从单实例演进到集群
2. **清晰的接口契约** — Dubbo 接口、REST 规范、protobuf IDL，让各团队并行开发
3. **量化的质量目标** — 110 万连接/节点、5,000 TPS，不是模糊描述
4. **透明的技术决策** — 每个关键选型都有 ADR 记录背景、候选方案、决策理由
5. **可操作的改进路径** — 从当前版本到近期、中期的演进步骤清晰
6. **AI 原生思维** — SAI 协议旁路推送、多 Agent 路由、本地 LLM 集成路线

完整源码参见 [chat-server-pro](https://github.com/comsince/universe_push)，完整架构设计文档见项目 `docs/ARCHITECTURE_DESIGN.md`。
