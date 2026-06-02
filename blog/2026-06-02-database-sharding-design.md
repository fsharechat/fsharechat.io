---
title: 飞享IM数据库分库分表设计方案——从现状分析到亿级扩容全解析
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [IM, 即时通讯, 数据库, 分库分表, ShardingSphere, MySQL, 高可用, 架构设计]
---

分库分表不是一个简单的配置问题——它关系到分片键选择、扩容数学性质、跨分片查询策略，以及在不停服前提下如何安全迁移数据。本文以飞享IM（FshareIM）为案例，从现有手动分表方案的瓶颈出发，完整呈现三种技术路线对比、基于 ShardingSphere-JDBC 的新建分库方案、按 2 的幂扩容的数学推导，以及 Canal + 双写的零停机迁移时序，供 IM 系统架构师和 DBA 参考。

<!--truncate-->

---

## 一、现状分析

### 1.1 已有分片方案

项目当前在单个 MySQL 实例上做了手动分表，核心逻辑位于 `MessageShardingUtil.java`。

| 表 | 分片数 | 分片键 | 算法 |
|----|--------|--------|------|
| `t_messages_0~35` | 36 | 消息 ID 中内嵌的时间戳 | `(year % 3) * 12 + month` |
| `t_user_messages_0~127` | 128 | `_uid` | `uid.hashCode() % 128` |

消息 ID 结构（Snowflake 变体）：

```
ID = timestamp(43位) + nodeId(6位) + rotateId(15位)
支持 64 个节点，每节点每毫秒 32768 条消息
```

### 1.2 现有方案的瓶颈

**`t_messages` 时间分片的问题：**
- 同一个月所有消息写入同一张表，单月高流量下写入热点无法消除
- 3 年后表会被复用（2018 年和 2021 年写同一张表），历史数据无法区分
- 拉取历史消息需跨多张表扫描，当前代码最多循环查 12 张表：

```java
// DatabaseStore.java:617
for (int monthsBack = 1; monthsBack < 12 && messages.size() < count; monthsBack++) {
    String table = MessageShardingUtil.getPreviousMessageTable(beforeUid, monthsBack);
    // 每次都要再查一张表...
}
```

**`t_user_messages` hash 分片的问题：**
- `uid.hashCode()` 依赖 JVM 实现，不同语言/环境结果可能不同，不适合跨系统使用
- 128 张表固定，扩容需要全量数据重新 hash

**全局瓶颈：**
- 所有分片在同一个 MySQL 实例，分表只解决了单表大小，未解决写吞吐
- `t_id_generator` 自增表是严重写热点（每条消息都需要先插入获取全局 ID）
- 以下高频表完全没有分片保护：

```
t_user            — 用户基础信息
t_friend          — 好友关系，随用户数平方增长
t_group_member    — 群成员，大群场景下极重
t_user_session    — 在线会话，高频写
t_friend_request  — 好友申请
```

---

## 二、演进路径选择

### 2.1 三种方案对比

| 维度 | 方案A：MySQL + ShardingSphere | 方案B：TiDB | 方案C：HBase/Cassandra |
|------|-------------------------------|-------------|------------------------|
| 代码改动量 | 小（改 SQL 配置） | 极小（去掉手动分片） | 大（重写消息层） |
| 运维难度 | 中 | 高 | 极高 |
| 扩展上限 | 千万 DAU | 亿级 DAU | 数十亿级 |
| 扩容难度 | 高（需停服迁移） | 低（自动） | 低（自动） |
| 资源成本 | 低 | 中高 | 高 |
| 分布式事务 | 需额外引入 Seata | 原生支持 | 不支持 |
| 适用阶段 | 当前 → 百万级 | 百万 → 亿级 | 亿级以上 |

### 2.2 推荐演进路径

```
当前（存量系统）        中期（百万级）          长期（亿级）
─────────────────  →  ──────────────────  →  ──────────────────
修复 t_id_generator    TiDB 在线迁移           消息冷热分离
加消息读缓存            合并手动分片表           历史消息归档对象存储
MySQL 加只读副本        彻底解决扩展性
```

> **不建议对存量系统做分片键改造**（时间分片 → target hash），因为需要全量重写现有数据，迁移成本极高。

---

## 三、从零部署的分库分表设计

> 本章为新项目或完全重建场景的参考设计。

### 3.1 整体架构

```
应用层（push-group）
        │ JDBC
        ▼
ShardingSphere-JDBC（嵌入式，无额外进程）
        │ 按分片键路由
   ┌────┴────────────────┐
 db_0   db_1   db_2   db_3     （4 个 MySQL 实例）
 每库包含各业务表的 4 个分片（共 16 个逻辑分片）
```

**分库数选 4（2 的幂），便于后续按 2 倍扩容。**

### 3.2 各表分片键设计

#### 用户维度（Binding Table，同 uid 落同一库，支持库内 JOIN）

| 表 | 分片键 | 分库算法 | 分表算法 |
|----|--------|----------|----------|
| `t_user` | `_uid` | `CRC32(_uid) % 4` | `CRC32(_uid) % 4` |
| `t_friend` | `_uid` | `CRC32(_uid) % 4` | `CRC32(_uid) % 4` |
| `t_friend_request` | `_uid` | `CRC32(_uid) % 4` | `CRC32(_uid) % 4` |
| `t_user_messages` | `_uid` | `CRC32(_uid) % 4` | `CRC32(_uid) % 4` |
| `t_user_session` | `_uid` | `CRC32(_uid) % 4` | `CRC32(_uid) % 4` |
| `t_user_setting` | `_uid` | `CRC32(_uid) % 4` | `CRC32(_uid) % 4` |

#### 会话维度

| 表 | 分片键 | 分库算法 | 分表算法 |
|----|--------|----------|----------|
| `t_messages` | `_target` | `CRC32(_target) % 4` | `CRC32(_target) % 4` |

#### 群组维度（Binding Table，同 gid 落同一库）

| 表 | 分片键 | 分库算法 | 分表算法 |
|----|--------|----------|----------|
| `t_group` | `_gid` | `CRC32(_gid) % 4` | `CRC32(_gid) % 4` |
| `t_group_member` | `_gid` | `CRC32(_gid) % 4` | `CRC32(_gid) % 4` |
| `t_channel` | `_cid` | `CRC32(_cid) % 4` | `CRC32(_cid) % 4` |
| `t_channel_listener` | `_cid` | `CRC32(_cid) % 4` | `CRC32(_cid) % 4` |

#### 广播表（每库全量复制，无需路由）

```
t_sensitiveword   — 敏感词，数据量小，全库只读
t_robot           — 机器人配置
t_chatroom        — 聊天室
```

### 3.3 ShardingSphere 配置

```yaml
spring:
  shardingsphere:
    datasource:
      names: db0,db1,db2,db3
      db0:
        url: jdbc:mysql://mysql-0:3306/fsharechat
      db1:
        url: jdbc:mysql://mysql-1:3306/fsharechat
      db2:
        url: jdbc:mysql://mysql-2:3306/fsharechat
      db3:
        url: jdbc:mysql://mysql-3:3306/fsharechat

    rules:
      sharding:
        tables:
          t_messages:
            actual-data-nodes: db${0..3}.t_messages_${0..3}
            database-strategy:
              standard:
                sharding-column: _target
                sharding-algorithm-name: hash-mod-4
            table-strategy:
              standard:
                sharding-column: _target
                sharding-algorithm-name: hash-mod-4

          t_user_messages:
            actual-data-nodes: db${0..3}.t_user_messages_${0..3}
            database-strategy:
              standard:
                sharding-column: _uid
                sharding-algorithm-name: hash-mod-4
            table-strategy:
              standard:
                sharding-column: _uid
                sharding-algorithm-name: hash-mod-4

          t_user:
            actual-data-nodes: db${0..3}.t_user_${0..3}
            database-strategy:
              standard:
                sharding-column: _uid
                sharding-algorithm-name: hash-mod-4
            table-strategy:
              standard:
                sharding-column: _uid
                sharding-algorithm-name: hash-mod-4

          t_friend:
            actual-data-nodes: db${0..3}.t_friend_${0..3}
            database-strategy:
              standard:
                sharding-column: _uid
                sharding-algorithm-name: hash-mod-4
            table-strategy:
              standard:
                sharding-column: _uid
                sharding-algorithm-name: hash-mod-4

          t_group:
            actual-data-nodes: db${0..3}.t_group_${0..3}
            database-strategy:
              standard:
                sharding-column: _gid
                sharding-algorithm-name: hash-mod-4
            table-strategy:
              standard:
                sharding-column: _gid
                sharding-algorithm-name: hash-mod-4

          t_group_member:
            actual-data-nodes: db${0..3}.t_group_member_${0..3}
            database-strategy:
              standard:
                sharding-column: _gid
                sharding-algorithm-name: hash-mod-4
            table-strategy:
              standard:
                sharding-column: _gid
                sharding-algorithm-name: hash-mod-4

        binding-tables:
          - t_user,t_friend,t_user_messages,t_user_session,t_user_setting
          - t_group,t_group_member

        broadcast-tables:
          - t_sensitiveword
          - t_robot
          - t_chatroom

        sharding-algorithms:
          hash-mod-4:
            type: HASH_MOD
            props:
              sharding-count: 4
```

### 3.4 全局 ID 策略

废弃 `t_id_generator` 自增表（写热点），直接使用项目已有的 Snowflake 实现：

```java
// MessageShardingUtil.generateId() 已经可以直接使用
// ID = timestamp(43) + nodeId(6) + rotateId(15)
// 支持 64 个节点，每节点每毫秒 32768 条消息，可用至 2157 年
long messageId = MessageShardingUtil.generateId();
```

### 3.5 用户搜索的特殊处理

`t_user` 按 `_uid` 分片后，`WHERE _mobile = ?` 会变成全库广播查询。解法：

```
方案A（简单）：t_user 不分表，单表 + 从库承载搜索请求
              用户表通常几百万行，加索引后单表可以承载

方案B（严格）：独立建 t_user_index 表（只存 uid/mobile/name）
              不分片，用于搜索；t_user 按 uid 分片存完整信息
```

### 3.6 消息拉取的跨分片处理

`t_user_messages`（按 uid 分片）和 `t_messages`（按 target 分片）分片键不同，拉取消息需要两次路由：

```
1. 查 t_user_messages_{uid_hash}  →  得到 [_mid1, _mid2, ...]

2. 每个 _mid 对应的消息在哪个 t_messages 分片？
   通过消息的 _target 字段计算：CRC32(_target) % 16
   将 mid_list 按 target_hash 分组：{db0: [mid1,mid3], db1: [mid2], ...}

3. 并行查各分片的 t_messages，批量 IN 查询

4. 合并结果，按 _seq 排序返回
```

---

## 四、扩容方案

### 4.1 按 2 的幂扩容的数学性质

使用 `CRC32(key) % N` 分片，从 N→2N 时：

**原来在 shard `i` 的数据，扩容后只有两个去处：留在 shard `i`，或迁到 shard `i+N`。**

```
4库→8库示例：

hash=1  → 1%4=1 (db1) → 1%8=1 (db1)    留在 db1
hash=5  → 5%4=1 (db1) → 5%8=5 (db5)    迁到 db5
hash=9  → 9%4=1 (db1) → 9%8=1 (db1)    留在 db1
hash=13 → 13%4=1(db1) → 13%8=5(db5)    迁到 db5

规律：CRC32 值的第 log2(N) 位为 1 的数据需要迁移
      即：CRC32(_target) % 8 >= 4 的数据从 db1 → db5
```

每个旧分片恰好一半数据留下，一半迁出。

### 4.2 迁移数据的 SQL 识别

```sql
-- 找出 db0.t_messages_0 中需要迁到 db4 的数据
SELECT * FROM t_messages_0
WHERE (CRC32(_target) % 8) >= 4;

-- 留在 db0 的数据
SELECT * FROM t_messages_0
WHERE (CRC32(_target) % 8) < 4;
```

> **关键前提**：分片 hash 函数必须使用 `CRC32`，不能用 Java 的 `String.hashCode()`（不同 JVM 实现结果可能不同，且 SQL 层无法还原）。

### 4.3 容量规划

```
初始：4库 × 4表 = 16 个逻辑分片
每分片建议上限：3000万行（InnoDB 性能较优区间）
t_messages 总容量：16 × 3000万 = 4.8亿条消息

第一次扩容（4库→8库）：9.6亿条消息
第二次扩容（8库→16库）：19.2亿条消息

扩容时机：单分片超过 3000万行时开始准备
```

---

## 五、双写迁移方案

### 5.1 推荐：Canal 监听 Binlog（应用层零改动）

```
应用层只写旧库（不变）
       │
   旧库 MySQL（开启 binlog ROW 格式）
       │
    Canal（过滤：CRC32(_target) % 8 >= 4 的行）
       │
   新库（db4~db7）
```

Canal 同时处理：
- 存量数据全量迁移
- 迁移期间新写入的增量同步

当 Canal lag 降至 0 后，停写数秒完成切换。

### 5.2 备选：应用层手动双写

当无法引入 Canal 时，在 `DatabaseStore.java` 中实现：

```java
public void persistMessage(Message message) {
    String target = message.getTarget();
    long crc = getCRC32(target);  // 使用 CRC32，不用 hashCode

    // 步骤1：写旧库（主写，必须成功）
    int oldShardIndex = (int)(crc % 4);
    insertMessage(dataSourceMap.get("db" + oldShardIndex), message);

    // 步骤2：判断是否需要双写到新库
    if (!migrationConfig.isDualWriteEnabled()) return;
    int newShardIndex = (int)(crc % 8);
    if (newShardIndex < 4) return;  // 这条数据不迁移

    // 步骤3：异步写新库，失败不影响主流程
    migrationExecutor.execute(() -> {
        try {
            insertMessageIgnoreDuplicate(  // INSERT IGNORE 保证幂等
                dataSourceMap.get("db" + newShardIndex), message
            );
        } catch (Exception e) {
            failedMigrationQueue.offer(message.getMessageId());  // 补偿队列
            log.warn("dual write failed, mid={}", message.getMessageId());
        }
    });
}
```

### 5.3 完整切换时序

```
T0  启动新库 db4~db7，建好表结构
    ↓
T1  开启双写（migrationConfig.dualWriteEnabled = true）
    ↓
T2  Canal 或补偿任务迁移存量数据
    ↓
T3  Canal lag 降至 0，补偿队列清空
    ↓
T4  停写（秒级）
    ↓
T5  校验数据一致性
    SELECT COUNT(*) FROM db0.t_messages_0 WHERE CRC32(_target) % 8 >= 4;
    -- 对比 db4.t_messages_0 的 COUNT(*)
    ↓
T6  更新 ShardingSphere 配置（sharding-count: 4 → 8）
    ↓
T7  恢复写入，流量切到新库
    ↓
T8  观察新库运行稳定 24~48 小时
    ↓
T9  清理旧库已迁出数据
    DELETE FROM db0.t_messages_0 WHERE CRC32(_target) % 8 >= 4;
```

### 5.4 风险与应对

| 风险 | 现象 | 应对 |
|------|------|------|
| 新库写失败 | 消息在旧库有、新库无 | INSERT IGNORE + 补偿队列重试；Canal 兜底 |
| 切换瞬间请求打到旧库 | 路由未完全刷新 | ShardingSphere 热更新配置；停写窗口保护 |
| 旧库数据清理过早 | 删了还有读流量的数据 | T9 延迟到切换后 24~48 小时再执行 |
| hash 函数不一致 | Java 和 SQL 计算结果不同 | 统一用 CRC32，禁用 `String.hashCode()` |

---

## 六、现有代码改造点

| 文件 | 改动内容 |
|------|----------|
| `MessageShardingUtil.java` | 删除 `getMessageTable()` 时间分片逻辑；hash 函数改为 CRC32 |
| `DatabaseStore.java` | 删除所有手动拼表名的 SQL；改写为标准 SQL，路由由 ShardingSphere 负责 |
| `pom.xml` | 添加 `shardingsphere-jdbc` 依赖 |
| `application.properties` | 替换为 ShardingSphere 数据源配置 |
| 消息写入路径 | 废弃 `t_id_generator` INSERT，改用 `MessageShardingUtil.generateId()` |

---

## 小结

飞享IM 的分库分表演进核心结论：

1. **不动存量** — 对运行中的系统做分片键改造得不偿失，优先通过缓存和只读副本扛住当前规模
2. **分片键选 CRC32** — 跨语言一致，SQL 层可验证，是 hash 分片的唯一正确选择
3. **4 的幂初始规划** — 4 库 × 4 表 = 16 分片，每次 2 倍扩容，数学上只需迁移一半数据
4. **Canal 优于双写** — 应用层双写引入主写失败风险，Canal binlog 方式零改动且可回滚
5. **Binding Table 消灭跨库 JOIN** — 用户维度和群组维度各自绑定，确保关联查询不跨库
