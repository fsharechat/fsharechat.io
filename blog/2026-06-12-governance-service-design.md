---
title: Governance Service 架构设计：流式 LLM Agent 的异步治理层
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [LLM, SpringBoot, Kafka, MySQL, Governance, 审计, 成本计算, Prometheus]
---

本文介绍 streaming-llm-agent 多模块项目中 **Governance Service** 的详细架构设计。Governance Service 是异步治理层，**不在对话关键路径上**——Chat Service 通过 Kafka fire-and-forget 发布事件，Governance Service 异步消费，完成审计落地、成本计算、指标汇总和配额管理。

<!--truncate-->

**日期**：2026-06-12  
**所属项目**：streaming-llm-agent（多模块，Plan 2）  
**前置依赖**：Chat Service（Plan 1）已完成，Kafka topics 和 Redis 配额计数器已由 Chat Service 写入

---

## 1. 定位与职责

Governance Service 是异步治理层，**不在对话关键路径上**。Chat Service 通过 Kafka fire-and-forget 发布事件，Governance Service 异步消费，完成审计落地、成本计算、指标汇总和配额管理。

**设计原则**：Governance 宕机不影响 Chat Service 对话，配额扣减通过 Redis 计数器在 Chat Service 本地完成，不走同步 HTTP 调用。

---

## 2. 项目结构

### 2.1 多模块位置

```
streaming-llm-agent/
├── pom.xml                          # 父 POM，新增 governance-service 子模块
├── docker-compose.yml               # 新增 MySQL 服务
├── chat-service/                    # 已完成
└── governance-service/              # 本次新增，端口 8081
```

### 2.2 包结构

```
governance-service/src/main/java/com/example/governance/
├── GovernanceServiceApplication.java
├── consumer/
│   ├── AuditEventConsumer.java      # @KafkaListener ai-audit-topic，concurrency=4
│   └── CancelEventConsumer.java     # @KafkaListener ai-cancel-topic，concurrency=2
├── service/
│   ├── AuditLogService.java         # 审计日志落地
│   ├── CostCalculatorService.java   # Token 成本计算（读 model_pricing）
│   ├── QuotaPolicyService.java      # 配额策略 CRUD（读写 Redis）
│   └── MetricsExporterService.java  # Prometheus 指标注册与更新
├── mapper/
│   ├── AuditLogMapper.java
│   ├── BillingRecordMapper.java
│   └── ModelPricingMapper.java
├── entity/
│   ├── AuditLog.java
│   ├── BillingRecord.java
│   └── ModelPricing.java
├── controller/
│   └── AdminController.java         # REST /admin/**
├── dto/
│   ├── AuditEvent.java              # Kafka 消息反序列化 DTO
│   └── CancelEvent.java
└── config/
    ├── GovernanceProperties.java    # @ConfigurationProperties prefix=gov
    └── KafkaConsumerConfig.java     # Consumer Group、并发数、offset 策略
```

### 2.3 技术栈

| 依赖 | 用途 |
|---|---|
| `spring-boot-starter-web` | WebMVC，Admin REST API |
| `spring-boot-starter-actuator` | `/actuator/prometheus` |
| `spring-kafka` | Kafka Consumer |
| `mybatis-plus-boot-starter:3.5.7` | MyBatis-Plus ORM |
| `mysql-connector-j` | MySQL JDBC |
| `micrometer-registry-prometheus` | Prometheus 指标 |
| `spring-boot-starter-data-redis` | 读 Redis 配额计数、写配额策略 |
| `lombok` | 简化代码 |

---

## 3. Kafka 消费设计

### 3.1 AuditEventConsumer（直联模式）

```
@KafkaListener(topics="ai-audit-topic",
               concurrency="4",
               groupId="governance-audit-group")
consume(AuditEvent event):
  1. auditLogService.save(event)         → INSERT audit_log（request_id 唯一索引幂等）
  2. costCalculatorService.calc(event)   → INSERT billing_record（读 model_pricing 单价）
  3. metricsExporterService.record(event)→ 更新 Prometheus Gauge/Counter
```

### 3.2 CancelEventConsumer

```
@KafkaListener(topics="ai-cancel-topic",
               concurrency="2",
               groupId="governance-cancel-group")
consume(CancelEvent event):
  1. auditLogService.saveCancel(event)   → INSERT audit_log（status="cancelled"）
```

### 3.3 可靠性保障

| 机制 | 说明 |
|---|---|
| **幂等** | `audit_log.request_id` 唯一索引，重复消费不写两条 |
| **Offset 提交** | `MANUAL_IMMEDIATE`，DB 写入成功后提交，保证 at-least-once |
| **Dead Letter Topic** | 反序列化失败发 `ai-audit-dlt`，不阻塞主消费 |
| **DB 写入失败** | RetryTemplate 重试 3 次，超限后记录告警日志 |

---

## 4. 数据库 Schema（governance_db）

### 4.1 audit_log — 审计日志表

```sql
CREATE TABLE audit_log (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id    VARCHAR(64) UNIQUE NOT NULL,   -- 幂等键（traceId+sessionId hash）
  session_id    VARCHAR(64) NOT NULL,
  user_id       VARCHAR(64) NOT NULL,
  model         VARCHAR(64) NOT NULL,
  input_tokens  INT     NOT NULL DEFAULT 0,
  output_tokens INT     NOT NULL DEFAULT 0,
  output_chars  INT     NOT NULL DEFAULT 0,
  duration_ms   BIGINT  NOT NULL DEFAULT 0,
  ttft_ms       BIGINT  NOT NULL DEFAULT 0,
  status        VARCHAR(20) NOT NULL,           -- completed / cancelled / error
  trace_id      VARCHAR(64),
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at)
);
```

### 4.2 billing_record — 账单记录表

```sql
CREATE TABLE billing_record (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  audit_log_id  BIGINT NOT NULL,
  user_id       VARCHAR(64) NOT NULL,
  model         VARCHAR(64) NOT NULL,
  input_tokens  INT           NOT NULL,
  output_tokens INT           NOT NULL,
  input_cost    DECIMAL(12,6) NOT NULL,         -- 输入 Token 费用（USD）
  output_cost   DECIMAL(12,6) NOT NULL,
  total_cost    DECIMAL(12,6) NOT NULL,
  billing_date  DATE          NOT NULL,         -- 按天聚合
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_user_date (user_id, billing_date),
  INDEX idx_model_date (model, billing_date)
);
```

### 4.3 model_pricing — 模型单价表（Admin API 动态修改）

```sql
CREATE TABLE model_pricing (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  model_name      VARCHAR(64) UNIQUE NOT NULL,
  input_price     DECIMAL(10,6) NOT NULL,       -- 每 1K token 价格（USD）
  output_price    DECIMAL(10,6) NOT NULL,
  currency        VARCHAR(8)    NOT NULL DEFAULT 'USD',
  effective_from  DATETIME      NOT NULL,
  updated_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_by      VARCHAR(64)
);

-- 初始数据
INSERT INTO model_pricing VALUES
  (1,'gpt-4o-mini', 0.000150, 0.000600, 'USD', NOW(), NOW(), 'system'),
  (2,'gpt-4o',      0.002500, 0.010000, 'USD', NOW(), NOW(), 'system');
```

---

## 5. Admin REST API（/admin/**）

所有端点在端口 8081，无鉴权（生产环境由 API Gateway 层控制）。

### 5.1 审计查询

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/admin/audit` | 分页查询，支持 `userId`、`from`、`to`、`page`、`size` 参数 |
| GET | `/admin/audit/{traceId}` | 按 traceId 精确查单条，前端报错定位用 |

### 5.2 成本汇总

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/admin/billing/summary` | 按 `userId` + `month`（yyyy-MM）汇总成本 |

### 5.3 配额管理

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/admin/quota/usage/{userId}` | 读 Redis 当前 RPM 计数 + 并发槽 |
| PUT | `/admin/quota/policy/{userId}` | 修改用户配额上限（写 Redis Hash `ai:quota:policy:{userId}`） |
| DELETE | `/admin/quota/session/{sessionId}` | 强制清除会话历史（DEL Redis key） |

> **Chat Service 联动说明**：`PUT /admin/quota/policy` 写入 Redis Hash 后，`RedisQuotaService` 需同步支持「动态策略读取」：先查 `ai:quota:policy:{userId}` 是否存在，存在则用其中的 `userRpm`/`userConcurrent`，否则回退到 `ChatProperties` 默认值。这部分改动属于 **Chat Service 小幅更新**，在 Governance Service 实现计划中作为独立任务包含。

### 5.4 模型单价管理

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/admin/pricing` | 列出所有模型单价 |
| PUT | `/admin/pricing/{model}` | 更新指定模型单价，立即生效 |

---

## 6. Prometheus 指标

### 6.1 Governance Service 暴露

| 指标名 | 类型 | 标签 | 说明 |
|---|---|---|---|
| `gov_cost_tokens_input_total` | Counter | model, userId | 输入 Token 累计 |
| `gov_cost_tokens_output_total` | Counter | model, userId | 输出 Token 累计 |
| `gov_cost_usd_total` | Counter | model, userId | 费用累计（USD） |
| `gov_kafka_consume_lag` | Gauge | topic | Kafka 消费积压量 |
| `gov_audit_process_duration_ms` | Timer | — | 审计事件处理耗时 |
| `gov_dead_letter_total` | Counter | topic | 进入 DLT 的消息数 |
| `gov_db_write_error_total` | Counter | table | DB 写入失败次数 |

### 6.2 告警规则（prometheus/rules/governance.yml）

```yaml
groups:
  - name: governance-alerts
    rules:
      - alert: KafkaConsumeLagHigh
        expr: gov_kafka_consume_lag{topic="ai-audit-topic"} > 10000
        for: 2m
        annotations:
          summary: "审计 Topic 积压超 10000 条，Governance 消费跟不上"

      - alert: DeadLetterTopicGrowing
        expr: increase(gov_dead_letter_total[5m]) > 10
        for: 1m
        annotations:
          summary: "5 分钟内超 10 条消息进入 DLT，疑似序列化问题"

      - alert: DBWriteErrorRateHigh
        expr: rate(gov_db_write_error_total[5m]) > 0.1
        for: 2m
        annotations:
          summary: "DB 写入错误率高，审计数据可能丢失"

  - name: chat-service-alerts
    rules:
      - alert: ChatErrorRateHigh
        expr: rate(ai_chat_error_total[5m]) / rate(ai_chat_completed_total[5m]) > 0.05
        for: 3m
        annotations:
          summary: "Chat Service 错误率超 5%"

      - alert: TTFTHigh
        expr: histogram_quantile(0.95, rate(ai_chat_ttft_ms_bucket[5m])) > 3000
        for: 2m
        annotations:
          summary: "首 Token 延迟 P95 超 3000ms"
```

---

## 7. 配置参考

```yaml
# governance-service/src/main/resources/application.yml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:mysql://${MYSQL_HOST:localhost}:3306/governance_db?useSSL=false&serverTimezone=UTC
    username: ${MYSQL_USER:root}
    password: ${MYSQL_PASSWORD:root}
    driver-class-name: com.mysql.cj.jdbc.Driver
  kafka:
    bootstrap-servers: ${KAFKA_SERVERS:localhost:9092}
    consumer:
      group-id: governance-audit-group
      auto-offset-reset: earliest
      enable-auto-commit: false
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}

mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  global-config:
    db-config:
      id-type: auto

management:
  endpoints:
    web:
      exposure:
        include: health,prometheus
  prometheus:
    metrics:
      export:
        enabled: true

gov:
  kafka:
    audit-topic: ai-audit-topic
    cancel-topic: ai-cancel-topic
    audit-dlt-topic: ai-audit-dlt
  retry:
    db-max-attempts: 3
    db-backoff-ms: 500
```

---

## 8. 扩展点

| 扩展场景 | 改动范围 |
|---|---|
| 多租户 | `audit_log` + `billing_record` 加 `tenant_id` 列，Admin API 加 `/tenants/{id}/` 前缀 |
| 新增通知渠道 | `MetricsExporterService` 加告警方法，或在 Grafana AlertManager 配置 receiver |
| 历史对话分析 | 新增 `AnalyticsService` 读 `audit_log`，Admin API 加 `/admin/analytics/**` |
| 账单导出 | `BillingExportService` 聚合 `billing_record`，生成 CSV/Excel |
