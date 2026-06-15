---
title: Spring Boot + LangChain4j 流式 LLM Agent 服务架构设计
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [LLM, SpringBoot, LangChain4j, 流式, 架构设计, Kafka, Redis, WebFlux]
---

本文介绍一套面向 AI 客服 / 问答助手场景的流式 LLM Agent 服务架构，技术栈为 **Spring Boot 3 + WebFlux + LangChain4j + Redis + Kafka**，采用 Chat Service + Governance Service 双服务分层设计，支持中等规模起步（日活十万级、峰值千级并发会话）并可平滑扩展至大规模。

<!--truncate-->

**日期**：2026-06-12  
**场景**：AI 客服 / 问答助手  
**规模**：中等规模起步（日活十万级，峰值千级并发会话），可平滑扩展至大规模  
**技术栈**：Spring Boot 3 + WebFlux + LangChain4j + Redis + Kafka  
**架构方案**：Chat Service + Governance Service 双服务

---

## 1. 整体架构

### 1.1 设计目标

| 目标 | 指标 |
|---|---|
| 首 Token 延迟（TTFT） | P95 < 3000ms |
| 系统可用性 | > 99.9% |
| 峰值并发会话 | 1000 路（起步），扩展至 10000 路 |
| Governance 故障隔离 | 审计/计费故障不影响对话主链路 |
| 多租户扩展成本 | 改 Key 前缀 + 换实现类，不动主流程 |

### 1.2 架构全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                           接入层                                     │
│         Nginx / API Gateway（Kong / Spring Cloud Gateway）           │
│         鉴权（JWT）· 租户路由预留 · 连接超时 · proxy_buffering off   │
└────────────────────────────┬────────────────────────────────────────┘
                             │  HTTP POST + text/event-stream
              ┌──────────────┴───────────────┐
              │                              │
┌─────────────▼──────────────┐   ┌───────────▼─────────────────────┐
│      Chat Service          │   │      Governance Service          │
│  Spring Boot 3 + WebFlux   │   │  Spring Boot 3 + WebMVC          │
│                            │   │                                  │
│  SSE Controller            │   │  Quota Admin API (REST)          │
│  AiChatStreamService       │   │  Rate Limit Engine（Redis）      │
│  LangChain4j Streaming     │   │  Audit Consumer（Kafka）         │
│  SessionService（Redis）   │   │  Cost Calculator                 │
│  QuotaService（Redis）     │   │  Alert Service                   │
│  EventPublisher（Kafka）   │   │  Metrics Exporter                │
└─────────┬──────────────────┘   └──────────────┬────────────────────┘
          │                                      │
          │         Redis（会话 / 配额）          │  Kafka（审计事件）
          │                                      │
┌─────────▼──────────────────────────────────────▼────────────────────┐
│                          共享基础设施                                 │
│  Redis Sentinel      Kafka（3 Broker）     LLM Provider              │
│  MySQL（审计/账单）  Prometheus + Grafana  Zipkin / Skywalking        │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.3 服务职责分工

**Chat Service**（延迟敏感，主链路）
- 接收用户请求，SSE 流式输出
- 调用 LangChain4j 流式推理
- Redis 读写会话历史
- Redis 检查配额（快速路径，无 RPC）
- Kafka 发布审计/取消/完成事件
- 首 Token 超时 + 总时长超时控制

**Governance Service**（异步治理，不在关键路径）
- 消费 Kafka 事件，落地审计日志
- 计算 Token 成本，更新配额账单
- 提供限流策略配置 Admin API
- 聚合 Prometheus 指标
- 预留多租户配额管理扩展点

**关键设计决策**：配额校验走 Redis 计数器（Chat Service 本地读），不走 Governance Service 同步 HTTP 调用。Governance 宕机不影响对话服务，配额扣减通过 Kafka 异步通知 Governance 结算。

---

## 2. 请求生命周期与数据流

### 2.1 正常完成链路（Happy Path）

```
用户 POST /api/ai/chat/stream
  │
  ▼
【接入层】Nginx（proxy_buffering off，proxy_read_timeout 300s）
  │
  ▼
【Chat Service - 请求装配阶段】                       目标 < 20ms
  1. 参数校验（sessionId、message ≤ 4000 chars、userId）
  2. Redis INCR 配额计数器（三维检查，详见第4节）
       超限 → 返回 429，发布 quota-exceeded 事件
  3. Redis GET 会话历史（最近 N 轮）
  4. 组装 ChatMessages（System Prompt + History + UserMessage）
  │
  ▼
【Chat Service - 流式推理阶段】                       WebFlux Flux<>
  5. LangChain4j.chat(messages, StreamingChatResponseHandler)
       firstTokenTimeout=8s / totalTimeout=60s
  6. onPartialResponse(token)
       → sink.next(ChatStreamEvent.token(...))        仅投递，零阻塞
       → SSE 推送给客户端
       → append 到内存 StringBuilder（上限 32000 chars）
       → 首 token 打点 TTFT 指标
  7. onCompleteResponse(response)
       → Redis SET 更新会话历史（异步 Mono.subscribe）
       → Kafka PRODUCE → ai-audit-topic（fire-and-forget）
       → sink.next(ChatStreamEvent.completed(...))
       → sink.complete()
  8. SSE 连接关闭
  │
  ▼
【Governance Service - 异步消费】                     不在关键链路
  消费 ai-audit-topic → 计算成本 → 落地审计 → 更新指标
```

### 2.2 异常与取消链路

| 场景 | 触发条件 | 处理动作 |
|---|---|---|
| 首 Token 超时 | 8s 无响应 | SSE error 事件，Kafka 发 `status:timeout/phase:first_token`，释放配额 |
| 用户中途取消 | SSE 连接断开 | `doOnCancel()` 触发，不写历史，Kafka 发 cancel 事件，释放配额 |
| 输出超长 | > 32000 chars | `onPartialResponse` 检测，`sink.error()`，SSE error 事件 |
| Provider 错误 | LLM 返回 5xx | 触发降级策略判断（详见第4节），Kafka 发 `status:provider_error` |

### 2.3 Kafka 事件流设计

```
Chat Service ──PRODUCE──► ai-audit-topic   ◄──CONSUME── Governance Service
             ──PRODUCE──► ai-cancel-topic  ◄──CONSUME── Governance Service
             ──PRODUCE──► ai-cost-topic    ◄──CONSUME── Governance Service
```

| Topic | Partitions | Retention | 用途 |
|---|---|---|---|
| ai-audit-topic | 12 | 7d | 审计、成本结算 |
| ai-cancel-topic | 6 | 3d | 取消行为分析 |
| ai-cost-topic | 6 | 30d | 账单、配额核销 |

分区键：`userId`（同用户事件顺序消费，便于会话级成本聚合）

---

## 3. Chat Service 内部模块设计

### 3.1 包结构

```
chat-service/
├── api/
│   ├── ChatStreamRequest.java      // record: sessionId, message, userId, model
│   ├── ChatStreamEvent.java        // record: type, sessionId, content, seq, traceId
│   └── ErrorCode.java              // 枚举: QUOTA_EXCEEDED, TIMEOUT, PROVIDER_ERROR...
│
├── controller/
│   └── ChatStreamController.java   // POST /api/ai/chat/stream → Flux<SSE<ChatStreamEvent>>
│
├── service/                        // 全部为接口，实现可替换
│   ├── AiChatStreamService.java    // Flux<ChatStreamEvent> stream(request)
│   ├── SessionService.java         // loadHistory / appendRound / clearSession
│   ├── QuotaService.java           // checkAndAcquire / release
│   ├── EventPublishService.java    // publishAudit / publishCancel / publishCost
│   └── ModelRouteService.java      // resolveModel(request) → StreamingChatModel
│
├── service/impl/
│   ├── DefaultAiChatStreamService.java  // 核心：桥接 LangChain4j → Reactor Flux
│   ├── RedisSessionService.java         // Redis String 存会话历史（JSON）
│   ├── RedisQuotaService.java           // Redis INCR 滑动窗口
│   ├── KafkaEventPublishService.java    // Kafka Producer fire-and-forget
│   └── DefaultModelRouteService.java    // 按配置选模型，预留多模型路由
│
├── config/
│   ├── AiModelConfig.java          // Bean: 主模型 + 降级模型
│   ├── RedisConfig.java            // ReactiveRedisTemplate
│   ├── KafkaConfig.java            // KafkaTemplate + Topic 定义
│   └── ChatProperties.java         // @ConfigurationProperties
│
├── governance/
│   ├── QuotaFilter.java            // WebFilter: 请求前置三维配额检查
│   └── TraceContextFilter.java     // WebFilter: 注入 traceId 到 Reactor Context
│
└── metrics/
    └── ChatMetricsService.java     // Micrometer: TTFT / 时长 / token / 取消率
```

### 3.2 核心流程：LangChain4j → Reactor Flux 桥接

```java
// DefaultAiChatStreamService.stream(request) 伪代码

Flux.<ChatStreamEvent>create(sink -> {
    List<ChatMessage> messages = sessionService.loadHistory(request.sessionId());
    messages.add(UserMessage.from(request.message()));
    StringBuilder output = new StringBuilder(1024);
    AtomicBoolean firstToken = new AtomicBoolean(false);
    AtomicLong seq = new AtomicLong(0);

    model.chat(messages, new StreamingChatResponseHandler() {

        public void onPartialResponse(String token) {
            if (output.length() + token.length() > maxOutputChars)
                { sink.error(new OutputTooLongException()); return; }
            output.append(token);
            if (firstToken.compareAndSet(false, true))
                metrics.recordTTFT(request, elapsed());
            sink.next(ChatStreamEvent.token(token, seq.incrementAndGet(), traceId));
        }

        public void onCompleteResponse(ChatResponse response) {
            // 异步写 Redis（不 block 主流）
            Mono.fromRunnable(() -> sessionService.appendRound(...))
                .subscribeOn(Schedulers.boundedElastic()).subscribe();
            // 异步发 Kafka（fire-and-forget）
            eventPublisher.publishAudit(request, output.toString(), elapsed());
            metrics.recordCompleted(request, elapsed());
            sink.next(ChatStreamEvent.completed(traceId));
            sink.complete();
        }

        public void onError(Throwable error) {
            metrics.recordFailed(request, error, elapsed());
            sink.next(ChatStreamEvent.error(error.getMessage(), traceId));
            sink.error(error);
        }
    });
})
.timeout(firstTokenTimeout, Flux.error(new FirstTokenTimeoutException()))
.timeout(totalTimeout)
.doOnCancel(() -> {
    eventPublisher.publishCancel(request, elapsed());
    metrics.recordCancelled(request, elapsed());
})
.doFinally(_ -> quotaService.release(request))   // 成功/失败/取消均执行
.onErrorMap(TimeoutException.class, ex -> new ChatTimeoutException(ex));
```

### 3.3 关键接口定义（多租户扩展点）

**QuotaService**
```
checkAndAcquire(request)
  → Redis INCR + EXPIRE（RPM 滑动窗口）
  → Redis INCR（并发槽）
  → 超限抛 QuotaExceededException
release(request)
  → Redis DECR（并发槽）
// 扩展点：TenantAwareQuotaService 增加 tenantId 前缀
```

**ModelRouteService**
```
resolveModel(request) → StreamingChatModel
  → 当前：返回默认主模型
  → 扩展：按 userId/场景/负载路由
degradedModel(level) → StreamingChatModel
  → Level1: 低成本模型
  → Level2: 极简单轮模型
// 扩展点：ModelRegistry 注册多模型，RoutingRule 配置路由策略
```

**SessionService**
```
loadHistory(sessionId) → List<ChatMessage>
  → Redis GET ai:session:history:{sessionId}
  → 不存在返回空列表
appendRound(id, user, assistant)
  → 追加并裁剪至 maxHistory 轮
  → SET with TTL（12h）
// 扩展点：SummarizingSessionService 长会话自动摘要
```

### 3.4 关键约束

1. **`onPartialResponse` 回调线程严禁阻塞 I/O**（Redis/DB/Kafka 同步调用），否则拖慢 token 输出速率
2. Redis 写历史和 Kafka 发事件均使用 **`Mono.subscribe()`（fire-and-forget）**，不 block 主流
3. **`doFinally` 保证 `quotaService.release()` 一定执行**，即使 onError 或 cancel
4. StringBuilder 输出缓冲设 **32000 chars 上限**，防止超长生成撑爆堆内存

---

## 4. Governance Service + 降级策略

### 4.1 Governance Service 包结构

```
governance-service/
├── consumer/
│   ├── AuditEventConsumer.java     // @KafkaListener ai-audit-topic，concurrency=4
│   ├── CancelEventConsumer.java    // @KafkaListener ai-cancel-topic
│   └── CostEventConsumer.java      // @KafkaListener ai-cost-topic
├── service/
│   ├── AuditLogService.java        // 落地审计日志（MySQL）
│   ├── CostCalculatorService.java  // Token 单价 × 数量 → 账单表
│   ├── QuotaPolicyService.java     // 配额策略 CRUD
│   └── AlertService.java           // 超阈值告警（钉钉/邮件）
├── controller/
│   └── AdminController.java        // REST: 查用量 / 改策略 / 重置会话
└── metrics/
    └── GovernanceMetricsExporter.java  // 聚合 Prometheus 指标
```

### 4.2 限流引擎（Chat Service 侧 Redis 执行）

三个维度独立控制：

| 维度 | Redis Key | 操作 | 默认阈值 |
|---|---|---|---|
| 用户 RPM | `ai:quota:rpm:{userId}` | INCR + EXPIRE 60s | 10次/分钟 |
| 用户并发会话 | `ai:quota:concurrent:{userId}` | INCR 进 / DECR 出 | 3路并发 |
| 模型全局并发 | `ai:quota:model:{model}:concurrent` | INCR 进 / DECR 出 | 主模型50，降级模型200 |

执行顺序（QuotaFilter 中）：
1. 检查 RPM → 超限返回 429
2. 检查用户并发 → 超限返回 429
3. 检查模型并发 → 超限触发降级模型选择（不直接拒绝）
4. 三者均通过 → 放行

多租户扩展：Key 增加 `{tenantId}` 前缀，策略从 Governance Admin API 动态加载，Redis 缓存 30s。

### 4.3 四级降级策略

```
Level 0：正常
  主模型（claude-sonnet-4-6）
  完整历史上下文（最近 12 轮）
  ↓ 触发：主模型并发超限 OR Provider 连续失败 ≥ 3次（熔断）

Level 1：模型降级
  切换低成本模型（claude-haiku-4-5）
  历史上下文缩减至最近 6 轮
  SSE 携带 warning 事件告知用户
  ↓ 触发：降级模型不可用 OR TTFT P95 > 15s

Level 2：极简模式
  单轮问答（不带历史上下文）
  仅 System Prompt + 当前消息
  SSE warning 事件告知质量受限
  ↓ 触发：所有模型不可用 OR 全局错误率 > 30%

Level 3：拒绝服务
  返回 503 + Retry-After header
  SSE error：{ type:"error", content:"service_unavailable" }
  Kafka 告警事件 → AlertService 触发通知
```

熔断器（Resilience4j CircuitBreaker）：
- 每个 LLM Provider 一个实例
- 失败率阈值：50%（10次请求窗口内）
- HALF_OPEN 探测：30s 后单次探测
- 状态变更发 Kafka 事件 → Governance 记录

### 4.4 Kafka 消费设计

```
AuditEventConsumer
  @KafkaListener(topics="ai-audit-topic", concurrency="4")
  动作：AuditLogService.save() → CostCalculatorService.calc() → Metrics.record()
  幂等保障：MySQL 审计表 requestId 唯一索引
  异常处理：反序列化失败 → Dead Letter Topic（ai-audit-dlt）
            数据库失败 → 重试3次 → 告警
  Consumer Group: governance-audit-group
  Offset: MANUAL_IMMEDIATE（手动提交）
```

---

## 5. 状态管理与可观测性

### 5.1 Redis 数据模型

Key 命名规范：`ai:{业务域}:{维度}:{id}`

| Key | Type | TTL | 用途 |
|---|---|---|---|
| `ai:session:history:{sessionId}` | String（JSON） | 12h（每次写刷新） | 会话历史 |
| `ai:quota:rpm:{userId}` | String（INCR） | 60s | 用户 RPM 限流 |
| `ai:quota:concurrent:{userId}` | String（INCR） | 无 | 用户并发槽 |
| `ai:quota:model:{model}:concurrent` | String（INCR） | 无 | 模型全局并发槽 |
| `ai:circuit:{model}:state` | String | 5min | 熔断器状态外部化 |

部署路径：单节点（开发）→ Redis Sentinel 1主2从（中等规模）→ Redis Cluster 3主3从（大规模）  
会话历史（DB0）与限流计数器（DB1）分 DB，隔离故障影响。

### 5.2 核心监控指标

| 指标 | 说明 | 告警阈值 |
|---|---|---|
| `ai_chat_ttft_ms` | 首 Token 延迟 | P95 > 3000ms 🔴 |
| `ai_chat_duration_ms` | 总会话时长 | P95 > 30000ms 🟡 |
| `ai_chat_error_total` | 错误次数（标签：error_type） | 错误率 > 5% 🔴 |
| `ai_chat_cancel_total` | 用户取消次数 | - |
| `ai_chat_timeout_total` | 超时次数（标签：phase） | 超时率 > 3% 🟡 |
| `ai_chat_inflight_sessions` | 当前活跃会话数 | > 800 🟡 预警 |
| `ai_chat_quota_exceeded_total` | 限流触发次数 | 突增 🟡 |
| `ai_cost_tokens_input_total` | 输入 Token 累计 | 成本监控 |
| `ai_cost_tokens_output_total` | 输出 Token 累计 | 成本监控 |
| `kafka_consumer_lag` | Governance 消费延迟 | > 10000 🔴 |

### 5.3 分布式追踪

TraceId 全链路透传路径：

```
HTTP 请求头（X-Trace-Id 或 W3C TraceParent）
  → TraceContextFilter → 写入 Reactor Context（线程切换安全）
  → SSE ChatStreamEvent.traceId 字段（前端报错可上报）
  → Kafka 消息体 traceId 字段
  → Governance 审计日志 traceId 列（可按 traceId 还原完整链路）
```

Span 层级（Micrometer Tracing + Zipkin/Skywalking）：
```
chat-service.stream-request
  ├── redis.load-session
  ├── langchain4j.chat（TTFT + 生成时长）
  ├── redis.save-session
  └── kafka.publish-audit
```

### 5.4 容量规划

| 组件 | 中等规模（起步） | 大规模（扩展目标） | 扩容方式 |
|---|---|---|---|
| Chat Service | 2 实例 × 4C8G | 8~16 实例 × 4C8G | HPA（inflight_sessions） |
| Governance Service | 1 实例 × 2C4G | 3 实例 × 2C4G | Kafka Consumer 扩分区 |
| Redis | Sentinel 1主2从 × 4C8G | Cluster 3主3从 × 8C16G | 扩 Cluster 节点 |
| Kafka | 3 Broker × 4C8G | 5 Broker × 8C16G | 扩 Broker + 分区数 |
| MySQL | 1主1从 × 4C16G | 1主2从 × 8C32G | 读写分离 |

HPA 触发指标：`inflight_sessions` P50 > 400 → 扩容；TTFT P95 > 3s 持续 2min → 扩容（不依赖 CPU）

### 5.5 Nginx 网关关键配置

```nginx
location /api/ai/chat/stream {
    proxy_http_version        1.1;
    proxy_set_header          Connection "";
    proxy_buffering           off;       # 必须：禁止缓冲，否则退化为假流式
    proxy_cache               off;
    chunked_transfer_encoding on;
    proxy_read_timeout        300s;      # 覆盖最长会话
    proxy_send_timeout        300s;
    proxy_pass                http://chat-service-upstream;
}
```

---

## 6. 多租户扩展点清单

当前设计为单租户，以下 5 处改动即可接入多租户，不动主流程：

| 扩展点 | 当前 | 多租户改动 |
|---|---|---|
| QuotaService Redis Key | `ai:quota:rpm:{userId}` | 增加 `{tenantId}` 前缀 |
| GovernanceProperties | 全局配置 | 改为按 tenantId 存 Redis，动态加载 |
| ModelRouteService | 默认主模型 | 增加 TenantModelPolicy，租户级模型绑定 |
| AuditLogService | 单表 | 增加 tenantId 分表路由 |
| AdminController | 全局 API | 增加 `/tenants/{id}/quota` API |

---

## 7. 关键配置参考

```yaml
app:
  ai:
    default-model: claude-sonnet-4-6
    degraded-model: claude-haiku-4-5
    max-history-messages: 12        # 正常模式历史轮数
    degraded-history-messages: 6    # 降级模式历史轮数
    max-prompt-chars: 12000
    max-output-chars: 32000
    first-token-timeout: 8s
    request-timeout: 60s
    session-ttl: 12h
  quota:
    user-rpm: 10
    user-concurrent: 3
    model-concurrent:
      claude-sonnet-4-6: 50
      claude-haiku-4-5: 200
  circuit-breaker:
    failure-rate-threshold: 50
    sliding-window-size: 10
    wait-duration-in-open-state: 30s
```

---

## 8. 前端消费约定

### SSE 事件结构

```json
{ "type": "token",     "sessionId": "xxx", "content": "你好", "seq": 1,  "traceId": "abc" }
{ "type": "completed", "sessionId": "xxx", "content": "",     "seq": -1, "traceId": "abc" }
{ "type": "error",     "sessionId": "xxx", "content": "first_token_timeout", "seq": -1, "traceId": "abc" }
{ "type": "warning",   "sessionId": "xxx", "content": "degraded_to_level1",  "seq": -1, "traceId": "abc" }
```

### 前端处理约定

- `token` 事件 → 增量渲染
- `completed` 事件 → 确认结束，关闭 loading 状态
- `error` 事件 → 展示提示，允许重试
- `warning` 事件 → 展示服务质量降级提示，不中断输出
- 页面切换/用户主动停止 → **必须** 调用 `reader.cancel()` 取消请求，避免无效计费

```javascript
// 推荐：使用 fetch streaming，支持 POST body
const response = await fetch("/api/ai/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sessionId, message, userId }),
  signal: abortController.signal  // 页面卸载时 abort()
});
```

---

## 9. 未覆盖范围（后续迭代）

| 项目 | 说明 |
|---|---|
| Tool Calling | 工具调用隔离服务，调用次数限制、权限控制 |
| RAG 集成 | 接入现有 RAG 企业架构 |
| 长会话摘要 | SummarizingSessionService，超长上下文自动压缩 |
| 流量录制回放 | 用于压测和线上问题复现 |
| A/B 测试路由 | ModelRouteService 扩展，按用户分桶选模型 |
| 多租户完整实现 | 基于第6节扩展点展开 |
