---
title: Java 面试核心技术点完整详解（并发 / 架构 / 数据库 / AI Agent）
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [Java, 面试, JMM, Spring, MySQL, Redis, 分布式, AI Agent, RAG]
---

整理了 20 个 Java 高频面试考点的系统讲解，涵盖并发内存模型、Spring 事务、高并发架构、数据库优化、分布式事务，以及 AI Agent / RAG 方向。每节附有代码示例与标准回答模板，可直接用于面试准备。

<!--truncate-->

## 目录

- [一、JMM — Java 内存模型](#一jmm--java-内存模型)
- [二、线程间通信与顺序控制](#二线程间通信与顺序控制)
- [三、Spring 事务失效的场景](#三spring-事务失效的场景)
- [四、Spring 统一异常处理](#四spring-统一异常处理)
- [五、Spring Boot 跨域解决方案](#五spring-boot-跨域解决方案)
- [六、高并发 SaaS 系统架构设计](#六高并发-saas-系统架构设计)
- [七、身份认证 — JWT 原理与安全](#七身份认证--jwt-原理与安全)
- [八、限流算法与熔断机制](#八限流算法与熔断机制)
- [九、Redis 限流具体实现](#九redis-限流具体实现)
- [十、MySQL 查询性能优化 — 四层体系](#十mysql-查询性能优化--四层体系)
- [十一、分库分表与全局唯一 ID](#十一分库分表与全局唯一-id)
- [十二、读写分离与数据一致性](#十二读写分离与数据一致性)
- [十三、缓存与数据库一致性](#十三缓存与数据库一致性)
- [十四、配置中心 — Apollo 与 CAP 理论](#十四配置中心--apollo-与-cap-理论)
- [十五、分布式事务](#十五分布式事务)
- [十六、AI Coding 使用技巧](#十六ai-coding-使用技巧)
- [十七、高并发 SaaS AI Agent 架构](#十七高并发-saas-ai-agent-架构)
- [十八、RAG 应用完整设计](#十八rag-应用完整设计)
- [十九、AI Agent 自我反思与工具重试](#十九ai-agent-自我反思与工具重试)
- [二十、多 Agent 架构设计](#二十多-agent-架构设计)

---

## 一、JMM — Java 内存模型

### 核心概念

JMM（Java Memory Model）是 JVM 规范中定义的一套规则，描述了 Java 程序中各种变量的**访问规则**，解决多线程环境下共享变量的可见性、有序性、原子性三大问题。

现代 CPU 每个核心都有自己的高速缓存，线程在运行时会把主内存中的变量拷贝到本地缓存中操作，操作完后再写回主内存，由此导致可见性问题：

```
主内存: x = 0

线程A（CPU核心1）                线程B（CPU核心2）
本地缓存: x = 0                  本地缓存: x = 0
执行: x = 1                      读取 x → 看到的是 0（旧值！）
写回主内存: x = 1
```

### 三大核心问题

#### 1. 可见性（Visibility）

```java
// 没有 volatile：线程可能永远看不到 flag 变为 true
private boolean flag = false;

// 加了 volatile：修改立即可见
private volatile boolean flag = false;

public void stop() {
    flag = true;   // 线程A：立即刷回主内存
}

public void run() {
    while (!flag) { // 线程B：每次从主内存读取最新值
        doWork();
    }
}
```

#### 2. 有序性（Ordering）— 双重检查锁 DCL

```java
// 错误写法：没有 volatile，instance = new Singleton() 不是原子的
// 实际执行顺序可能：① 分配内存 → ② instance 指向内存 → ③ 初始化对象
// 步骤②③重排后，其他线程可能拿到未初始化的对象
public class Singleton {
    private static Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}

// 正确写法：加 volatile 禁止重排序
private static volatile Singleton instance;
```

#### 3. 原子性（Atomicity）

```java
// i++ 看似一步，实际是：读取 → 加1 → 写回，三步之间可被中断
int i = 0;

// 解决方案1：synchronized
synchronized(this) { i++; }

// 解决方案2：AtomicInteger（CAS 实现，无锁，性能更好）
AtomicInteger atomicI = new AtomicInteger(0);
atomicI.incrementAndGet();
```

### happens-before 原则（高频考点前4条）

| 规则 | 说明 |
|------|------|
| 程序顺序规则 | 同一线程内，前面的操作 happens-before 后面的操作 |
| volatile 规则 | volatile 写操作 happens-before 后续的 volatile 读操作 |
| 锁规则 | unlock 操作 happens-before 后续对同一锁的 lock 操作 |
| 线程启动规则 | `Thread.start()` happens-before 线程内的任何操作 |

### volatile vs synchronized vs AtomicInteger

| 特性 | `volatile` | `synchronized` | `AtomicInteger` |
|------|-----------|----------------|-----------------|
| 可见性 | ✅ | ✅ | ✅ |
| 有序性 | ✅ | ✅ | ✅ |
| 原子性 | ❌ | ✅ | ✅ |
| 性能 | 高（无锁） | 低（加锁） | 中（CAS 自旋） |
| 适用场景 | 状态标志位、DCL | 复合操作、临界区 | 计数器、累加器 |

> **标准回答**：JMM 定义了 Java 线程与主内存之间的交互规则，解决可见性、有序性、原子性三个核心问题。volatile 解决可见性和有序性，但不保证原子性，所以 i++ 不能仅靠 volatile，需要 AtomicInteger 或 synchronized。

---

## 二、线程间通信与顺序控制

> 面试原题：一个线程结束了，另一个线程才开始，怎么实现？

### CountDownLatch（最常用）

```java
CountDownLatch latch = new CountDownLatch(1);

Thread threadA = new Thread(() -> {
    System.out.println("线程A 开始执行");
    try { Thread.sleep(2000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    System.out.println("线程A 执行完成");
    latch.countDown(); // 计数器 -1，变为0，唤醒等待线程
});

Thread threadB = new Thread(() -> {
    try { latch.await(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    System.out.println("线程B 开始执行（线程A完成后才执行）");
});

threadB.start();
threadA.start();
```

### CompletableFuture（现代写法，推荐）

```java
CompletableFuture<Void> futureA = CompletableFuture.runAsync(() -> {
    System.out.println("线程A 执行");
});

CompletableFuture<Void> futureB = futureA.thenRunAsync(() -> {
    System.out.println("线程B 在A完成后执行");
});

futureB.join();
```

### 各方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| `CountDownLatch` | 等待多个线程完成 | 灵活，可等待多个 | 一次性，不可重置 |
| `Thread.join()` | 简单顺序依赖 | 简单直观 | 强耦合 |
| `CompletableFuture` | 复杂异步流程编排 | 链式调用，功能强大 | 学习成本略高 |
| `Semaphore` | 资源访问控制 | 可控制并发数量 | 相对复杂 |

---

## 三、Spring 事务失效的场景

### Spring 事务底层原理

Spring 事务基于 **AOP 动态代理**实现。只要绕过了代理对象，事务就会失效。

```
调用方  →  Spring代理对象（AOP增强）  →  实际方法
              ↓ 开启事务
              ↓ 执行目标方法
              ↓ 提交事务 / 回滚事务
```

### 8 个失效场景

**场景1：同类内部方法调用（最常见）**

```java
@Service
public class OrderService {
    public void createOrder() {
        this.sendMessage(); // this 是原始对象，不是代理对象，@Transactional 不生效！
    }

    @Transactional
    public void sendMessage() {
        messageRepository.save(new Message());
    }
}

// 解决：注入自身代理对象
@Autowired
private OrderService self;

public void createOrder() {
    self.sendMessage(); // 通过代理对象调用，事务生效
}
```

**场景2：方法非 public**

Spring AOP 默认只能增强 `public` 方法。`private`、`protected` 方法上的 `@Transactional` 均失效。

**场景3：异常被 catch 吞掉**

```java
@Transactional
public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
    try {
        accountRepository.deduct(fromId, amount);
        accountRepository.add(toId, amount);
    } catch (Exception e) {
        log.error("转账失败", e);
        // 异常被捕获没有重新抛出，Spring 感知不到，不会回滚！
        // 修复：throw e; 或 TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
    }
}
```

**场景4：异常类型不匹配**

```java
// 默认只回滚 RuntimeException 和 Error
@Transactional(rollbackFor = Exception.class) // 显式指定回滚类型
public void saveData() throws Exception {
    throw new Exception("checked 异常，现在会回滚");
}
```

**场景5：多线程环境**

```java
@Transactional
public void asyncProcess() {
    new Thread(() -> {
        // 新线程不继承父线程事务上下文（ThreadLocal 绑定）！
        dataRepository.save(data);
    }).start();
}
```

**场景6-8**：Bean 未被 Spring 管理 / 数据库引擎不支持事务（MyISAM）/ 传播行为配置为 `NOT_SUPPORTED`。

### 常用传播行为

| 传播行为 | 说明 |
|----------|------|
| `REQUIRED`（默认） | 有事务就加入，没有就新建 |
| `REQUIRES_NEW` | 总是新建事务，挂起当前事务 |
| `NESTED` | 嵌套事务，有保存点 |
| `NOT_SUPPORTED` | 非事务执行，挂起当前事务 |

---

## 四、Spring 统一异常处理

```java
// 统一响应格式
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) { return new Result<>(200, "success", data); }
    public static <T> Result<T> fail(int code, String message) { return new Result<>(code, message, null); }
}

// 全局异常处理器
@RestControllerAdvice  // = @ControllerAdvice + @ResponseBody
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return Result.fail(400, "参数校验失败: " + message);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e, HttpServletRequest request) {
        log.error("系统异常: url={}", request.getRequestURI(), e);
        return Result.fail(500, "服务器内部错误，请稍后重试");
    }
}
```

---

## 五、Spring Boot 跨域解决方案

跨域根本原因：浏览器**同源策略**要求协议、域名、端口三者完全一致。

### 方案一：Nginx（推荐生产环境）

```nginx
location / {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
    if ($request_method = 'OPTIONS') { return 204; }
    proxy_pass http://backend:8080;
}
```

### 方案二：Spring Boot 全局配置

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 方案三：@CrossOrigin 注解（精细控制）

```java
@RestController
@CrossOrigin(origins = "http://frontend.example.com")
public class UserController { ... }
```

### 方案四：Spring Cloud Gateway

```java
@Bean
public CorsWebFilter corsWebFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.addAllowedOriginPattern("*");
    config.addAllowedMethod("*");
    config.addAllowedHeader("*");
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsWebFilter(source);
}
```

---

## 六、高并发 SaaS 系统架构设计

### 标准分层架构

```
用户请求
    ↓
【接入层】CDN → 负载均衡（Nginx/LVS）→ API Gateway
    ↓
【服务层】微服务集群（Spring Cloud）+ 熔断（Sentinel）+ 服务发现（Nacos）
    ↓
【缓存层】本地缓存（Caffeine）+ 分布式缓存（Redis Cluster）
    ↓
【数据层】MySQL（读写分离 + 分库分表）+ ElasticSearch（搜索）
    ↓
【消息层】RocketMQ / Kafka（削峰填谷 + 异步解耦）
    ↓
【存储层】对象存储（OSS）+ 分布式文件系统
```

### 多级缓存策略

```
请求 → L1本地缓存（Caffeine，毫秒级，无网络开销）
         ↓ 未命中
      L2分布式缓存（Redis，毫秒级，支持集群）
         ↓ 未命中
      数据库（最慢，最后防线）
```

### 消息削峰填谷

```
用户下单请求（峰值10万QPS）
    → MQ（RocketMQ，缓冲）
    → 消费者（稳定2000QPS消费）
    → 写入数据库（保护DB不被打垮）
```

---

## 七、身份认证 — JWT 原理与安全

### Session vs JWT

| 特性 | Session | JWT |
|------|---------|-----|
| 存储位置 | 服务端（内存/Redis） | 客户端（Header/Cookie） |
| 扩展性 | 差（需要集中存储） | 好（无状态，天然支持集群） |
| 安全性 | 较高（服务端可控） | 需要额外机制（黑名单） |

### JWT 三段结构

```
Header.Payload.Signature
```

```json
// Payload（Base64 编码，不是加密！不能存密码/手机号/身份证）
{
  "userId": 123,
  "roles": ["ADMIN"],
  "iat": 1699999000,
  "exp": 1700000000
}
```

### 实现代码

```java
@Component
public class JwtUtils {
    @Value("${jwt.secret}")
    private String secret;

    public String generateToken(Long userId, String username) {
        Map<String, Object> claims = Map.of("userId", userId, "username", username);
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600_000))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            throw new BusinessException(401, "Token 已过期");
        } catch (JwtException e) {
            throw new BusinessException(401, "Token 无效");
        }
    }
}
```

### 安全问题

**Token 无法主动失效**：用 Redis 维护黑名单，修改密码时将旧 Token 加入黑名单。

**推荐：双 Token 机制**

```
Access Token: 有效期 15 分钟，用于请求 API
Refresh Token: 有效期 7 天，存储在 HttpOnly Cookie，用于刷新 Access Token
```

---

## 八、限流算法与熔断机制

### 四种限流算法

| 算法 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| 固定窗口 | 固定时间段内计数 | 简单 | 边界突刺 | 低精度限流 |
| 滑动窗口 | 窗口随时间滑动 | 精确，无突刺 | 内存开销大 | 精确限流 |
| 漏桶 | 固定速率流出 | 强制匀速 | 突发流量全丢 | 流量整形 |
| 令牌桶 | 固定速率放令牌，允许突发消耗 | 允许突发 | 实现略复杂 | API 限速（**推荐**） |

```java
// Guava RateLimiter（令牌桶）
RateLimiter rateLimiter = RateLimiter.create(100.0); // 每秒 100 个请求

public void handleRequest() {
    if (!rateLimiter.tryAcquire()) {
        throw new BusinessException(429, "请求过于频繁，请稍后重试");
    }
    doProcess();
}
```

### 熔断三态状态机

```
                  失败率 > 阈值
  ┌─────────────────────────────────────────┐
  ↓                                         |
[关闭态 Closed]                          [打开态 Open]
正常通行，统计失败率         所有请求直接降级，不调用下游
                                         ↓ 经过熔断窗口
                                     [半开态 Half-Open]
                                     放少量探测请求
                                     ↓ 成功 → 关闭态
                                     ↓ 失败 → 打开态
```

```java
// Sentinel 熔断配置（推荐，Hystrix 已停止维护）
@SentinelResource(value = "queryUser", blockHandler = "handleBlock")
public User queryUser(Long userId) {
    return userRepository.findById(userId);
}
```

---

## 九、Redis 限流具体实现

### 滑动窗口限流（Lua 脚本保证原子性）

```java
@Component
public class RedisRateLimiter {

    @Autowired
    private StringRedisTemplate redisTemplate;

    public boolean isAllowed(String key, long windowMs, int maxCount) {
        long now = System.currentTimeMillis();
        long windowStart = now - windowMs;

        String script = """
            local key = KEYS[1]
            local now = tonumber(ARGV[1])
            local windowStart = tonumber(ARGV[2])
            local maxCount = tonumber(ARGV[3])
            local windowMs = tonumber(ARGV[4])

            redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)
            local count = redis.call('ZCARD', key)

            if count < maxCount then
                redis.call('ZADD', key, now, now .. '-' .. math.random(1000))
                redis.call('PEXPIRE', key, windowMs)
                return 1
            else
                return 0
            end
            """;

        Long result = redisTemplate.execute(
                new DefaultRedisScript<>(script, Long.class),
                Collections.singletonList(key),
                String.valueOf(now), String.valueOf(windowStart),
                String.valueOf(maxCount), String.valueOf(windowMs)
        );

        return result != null && result == 1;
    }
}
```

**使用**：每个 IP 每秒最多 10 次请求

```java
if (!rateLimiter.isAllowed("limit:api:getUser:" + ip, 1000, 10)) {
    throw new BusinessException(429, "请求太频繁，请稍后重试");
}
```

---

## 十、MySQL 查询性能优化 — 四层体系

### 第一层：SQL 写法优化

```sql
-- EXPLAIN 分析执行计划
EXPLAIN SELECT * FROM orders WHERE user_id = 123 AND status = 1;
-- type 目标：const > eq_ref > ref > range > index > ALL（避免 ALL）

-- ❌ 索引列使用函数，索引失效
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- ✅ 改写为范围查询
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- ❌ 隐式类型转换（phone 是 varchar，传了数字）
SELECT * FROM users WHERE phone = 13800138000;
-- ✅ 传字符串
SELECT * FROM users WHERE phone = '13800138000';
```

### 第二层：索引设计

**覆盖索引**：把查询列都放进索引，避免回表

```sql
-- 把查询列纳入索引，Extra 显示 Using index，性能大幅提升
CREATE INDEX idx_user_info ON users(user_id, name, email);
```

**联合索引最左前缀**：

```sql
-- 建立联合索引 (a, b, c)
-- ✅ a / a+b / a+b+c 都能走索引
-- ❌ 跳过 a 直接用 b，不走索引
```

### 第三层：架构优化

- **读写分离**：写主库，读从库，主从 binlog 异步同步
- **分库分表**：垂直分库（按业务）+ 水平分表（按 user_id % N）

### 第四层：参数配置优化

```sql
-- innodb_buffer_pool_size 设置为物理内存的 60-80%
-- 开启慢查询日志（long_query_time = 1s），用 pt-query-digest 分析
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;
```

---

## 十一、分库分表与全局唯一 ID

### 雪花算法（Snowflake）— 推荐

```
64位 Long 类型 ID：
┌─────────────────────────────────────────────────────────────────┐
│ 1bit符号位 │ 41bit时间戳(毫秒) │ 10bit机器ID │ 12bit序列号      │
└─────────────────────────────────────────────────────────────────┘

每毫秒最大 QPS = 4096 × 1000 = 409.6万/秒
```

```java
@Component
public class SnowflakeIdGenerator {
    private final long datacenterId;
    private final long machineId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    private static final long EPOCH = 1672531200000L;
    private static final long SEQUENCE_BITS = 12L;
    private static final long MAX_SEQUENCE = ~(-1L << SEQUENCE_BITS);

    public synchronized long nextId() {
        long timestamp = System.currentTimeMillis();
        if (timestamp < lastTimestamp) throw new RuntimeException("时钟回拨，拒绝生成ID");

        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0) {
                while (timestamp <= lastTimestamp) timestamp = System.currentTimeMillis();
            }
        } else {
            sequence = 0L;
        }
        lastTimestamp = timestamp;
        return ((timestamp - EPOCH) << 22) | (datacenterId << 17) | (machineId << 12) | sequence;
    }
}
```

---

## 十二、读写分离与数据一致性

### 主从复制原理

```
主库（Master）                    从库（Slave）
写入数据 → binlog（二进制日志）→  IO线程读取binlog
                                  → relay log → SQL线程回放
```

### 不一致解决方案

**方案1：强制读主库**（写操作后，在 ThreadLocal 中打标，下次读走主库）

**方案2：半同步复制**（主库等待至少一个从库确认收到 binlog 后才提交，牺牲写性能）

**方案3：缓存延迟双删**（写操作后设置短期"主库优先读"标记，TTL 与主从延迟时间一致）

---

## 十三、缓存与数据库一致性

### Cache Aside Pattern（旁路缓存）

**写流程：先更新 DB，再删缓存（不是更新缓存）**

```java
@Transactional
public void updateUser(User user) {
    userMapper.update(user);
    redisTemplate.delete("user:" + user.getId()); // 删缓存而非更新
}
```

**为什么是删缓存而不是更新缓存？**
并发场景下，两个线程先后更新 DB，但后更新的线程先更新缓存，先更新的线程后更新缓存，导致缓存值是旧数据。删缓存则下次读时重新从 DB 加载，得到正确值。

### 延迟双删策略

```java
@Transactional
public void updateUser(User user) {
    redisTemplate.delete("user:" + user.getId()); // 第一次删缓存
    userMapper.update(user);
    CompletableFuture.runAsync(() -> {
        try {
            Thread.sleep(500); // 等待主从同步
            redisTemplate.delete("user:" + user.getId()); // 第二次删缓存
        } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    });
}
```

### 缓存三大问题

| 问题 | 定义 | 解决方案 |
|------|------|----------|
| 穿透 | 查询不存在的数据，每次都打到 DB | 布隆过滤器 / 缓存空值 |
| 击穿 | 热点 key 过期，大量请求同时打到 DB | 互斥锁 / 逻辑过期 |
| 雪崩 | 大量 key 同时过期，DB 被打垮 | 过期时间加随机偏移 / 多级缓存 |

---

## 十四、配置中心 — Apollo 与 CAP 理论

### CAP 理论

分布式系统中，**一致性（C）**、**可用性（A）**、**分区容错（P）** 三者最多同时满足两个。

| 中间件 | CAP 类型 | 说明 |
|--------|----------|------|
| Zookeeper | CP | 选举期间不可用，保证一致性 |
| Nacos（临时实例） | AP | 优先可用，允许短暂不一致 |
| Eureka | AP | 没有主节点，高可用 |
| Apollo | CP | 基于 MySQL，配置一致性优先 |
| Redis Cluster | AP | 异步复制，允许少量数据丢失 |

---

## 十五、分布式事务

### 四种方案

**Seata AT 模式（最常用）**

```java
@GlobalTransactional
public void createOrder(OrderDTO dto) {
    orderService.create(dto);          // 订单服务DB
    inventoryService.deduct(dto.getProductId(), dto.getQuantity()); // 库存服务DB
    accountService.deduct(dto.getUserId(), dto.getAmount());         // 账户服务DB
}
```

AT 模式原理：一阶段本地提交 + 生成 undo_log；二阶段提交时删 undo_log，回滚时用 undo_log 生成补偿 SQL。

**TCC 模式（适合高并发）**

Try（资源预留）→ Confirm（真正执行）→ Cancel（释放预留）

三大问题：空回滚（Cancel 比 Try 先到）/ 幂等（重复调用）/ 悬挂（Try 晚于 Cancel 到）。

### 方案选型

| 方案 | 一致性 | 性能 | 适用场景 |
|------|--------|------|----------|
| XA | 强一致 | 差 | 短事务、对一致性要求极高 |
| Seata AT | 最终一致 | 较好 | 大多数业务场景（**推荐**） |
| TCC | 最终一致 | 好 | 高并发、对资源隔离要求高 |
| 本地消息表 | 最终一致 | 好 | 异步场景 |

---

## 十六、AI Coding 使用技巧

### Claude Code 工作流程

```
1. Plan 模式  → 提交需求，确认整体架构设计计划
2. Code 模式  → Claude 按计划生成代码，自动编译验证
3. 迭代修复   → 将编译错误/运行日志反馈给 Claude，循环迭代
```

### 提高准确度的关键：CLAUDE.md 上下文文件

```markdown
# CLAUDE.md

## 项目概述
用户账号管理系统，Spring Boot 3.x + MySQL 8 + Redis 6

## 代码规范
- 使用 Result<T> 统一响应格式
- 异常使用 BusinessException 自定义异常
- 所有日志使用 @Slf4j + log.info/warn/error
```

### 精确描述问题的 Prompt 模板

```
问题描述：[具体报错信息或异常行为]
相关文件：[文件路径和关键代码片段]
期望行为：[正确的结果应该是什么]
已尝试方案：[我已经试过了什么]
环境信息：[JDK版本、Spring Boot版本等]
```

---

## 十七、高并发 SaaS AI Agent 架构

AI 场景在第六章基础架构上，额外需要处理：

```
【AI Gateway】
    ├─ 流式响应支持（SSE / WebSocket）
    ├─ Token 计费与限流
    └─ 模型路由（不同请求用不同模型）

【Agent 层】
    ├─ Intent Router（意图识别，分发到对应 Agent）
    ├─ Task Queue（异步任务队列，处理长耗时任务）
    └─ Tool Registry（工具注册中心）

【LLM 层】
    ├─ 主模型：Claude / GPT（推理决策）
    ├─ Embedding 模型：文本向量化
    └─ LLM 代理池（负载均衡 + 限速管理）

【数据层】
    ├─ 向量数据库（Milvus / pgvector）— RAG 知识库
    ├─ 会话存储（Redis）— 多轮对话上下文
    └─ MySQL — 业务数据
```

---

## 十八、RAG 应用完整设计

### 离线：文档预处理链路

```
原始文档（PDF/Word/Markdown）
    → 文档解析 → 文本清洗 → 分块 → Embedding 向量化 → 向量数据库
```

**父子分块策略（推荐）**：
- 大块（1024字符）用于保留上下文 → 存储
- 小块（256字符）用于检索 → 找到小块后返回对应大块
- 检索精度 + 上下文完整性两全其美

### 在线：检索链路

```
用户问题
    → Query Rewriting（问题改写/分解）
    → 多路并行检索：向量检索（语义）+ BM25（关键词）
    → RRF 融合排序
    → Reranker 精排
    → Top-K 结果
```

**RRF 算法**：

```python
def rrf_merge(vector_results, bm25_results, k=60):
    scores = {}
    for rank, doc_id in enumerate(vector_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
    for rank, doc_id in enumerate(bm25_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
    return sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
```

### 置信度过低的处理策略

```python
if not results or results[0].score < threshold:
    # 多路检索补充 → 融合排序
    # 若仍不足 → 降级到 LLM 自身知识，并说明未找到相关知识库内容
```

---

## 十九、AI Agent 自我反思与工具重试

### ReAct 框架流程

```
用户输入
    ↓
[Thought] LLM 分析意图，决定是否需要工具
    ↓
[Action] 选择工具并生成调用参数
    ↓
[Observe] 执行工具，获取结果（失败 → 工具重试）
    ↓
[Reflect] LLM 评估结果是否满足目标  ← 自我反思
    ├─ 不满足 → 重新 Thought
    └─ 满足 → 输出最终答案

max_iterations = 6（防死循环）
```

### 自我反思（Reflection）实现

```java
public String answerWithReflection(String question) {
    String answer = agent.chat(question);

    for (int i = 0; i < 3; i++) {
        EvaluationResult evaluation = critic.evaluate(question, answer);
        if (evaluation.getScore() >= 7) break;

        // 根据 Critic 的反馈重新生成
        answer = agent.chat(String.format(
            "你的上一个回答存在以下问题：%s\n请改进后重新回答：%s",
            evaluation.getIssues(), question
        ));
    }
    return answer;
}
```

### 工具重试与防死循环

```java
try {
    toolResult = toolRegistry.execute(toolCall);
} catch (ToolException e) {
    // 工具失败时将错误信息反馈给 LLM，LLM 决定是否重试/换工具
    toolResult = String.format(
        "工具 %s 调用失败：%s。请尝试：1.修正参数；2.使用其他工具",
        toolCall.getName(), e.getMessage()
    );
}
// 超过 MAX_ITERATIONS 返回降级回答
```

---

## 二十、多 Agent 架构设计

### Supervisor 模式（主从模式）

```
用户输入 → Supervisor Agent（总调度）
                ├─ Research Agent（信息搜集）
                ├─ Analysis Agent（数据分析）
                ├─ Writing Agent（内容生成）
                └─ Review Agent（质量审核）
           ↓ 汇总结果 → 输出
```

### LangGraph 图结构（推荐）

```python
workflow = StateGraph(AgentState)
workflow.add_node("research", research_agent)
workflow.add_node("analysis", analysis_agent)
workflow.add_node("synthesis", synthesis_agent)

workflow.set_entry_point("research")
workflow.add_edge("research", "analysis")

# 条件路由：分析结果不足时回到搜索 Agent
def route_after_analysis(state: AgentState) -> str:
    return "research" if state["analysis_result"] == "需要更多信息" else "synthesis"

workflow.add_conditional_edges("analysis", route_after_analysis)
app = workflow.compile()
```

### Agent 间通信方式

| 通信方式 | 适用场景 | 优点 | 缺点 |
|----------|----------|------|------|
| 共享状态（AgentState） | 同进程内 | 简单，无序列化开销 | 无法跨进程 |
| HTTP/REST | 跨服务，同步调用 | 标准接口，语言无关 | 耦合度高 |
| MQ（消息队列） | 跨服务，异步调用 | 解耦，可靠，支持广播 | 最终一致性 |
| A2A 协议 | 异构 Agent 系统 | 标准化，互操作性强 | 生态尚在建设 |

---

## 记忆口诀汇总

| 知识点 | 口诀 |
|--------|------|
| JMM | 三问题"可见、有序、原子"，volatile 管前两个，synchronized 全包 |
| 熔断 | 三态"关-开-半开"，失败率触发，半开态探测恢复 |
| MySQL优化 | SQL层→索引层→架构层→参数层 |
| 事务失效 | 内部调用、非public、异常吞、类型不对、非Spring管理 |
| JWT | 三段"头-体-签"，Payload 不能放密码，失效靠黑名单 |
| 限流算法 | 固定-滑动-漏桶-令牌桶，生产首选令牌桶 |
| 缓存一致性 | 更新DB后删缓存，高并发加延迟双删 |
| ReAct | 想-做-看-反思，防死循环靠max_iterations |
| RAG置信度 | 不降阈值，选降级/换路/引导/补知识库 |
