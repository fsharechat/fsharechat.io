---
title: 10字节包头，两级命令字：飞享IM 二进制协议实践全解
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [IM, 即时通讯, 二进制协议, Java, 网络编程, 架构设计, 飞享IM]
image: /img/blog/2026-07-14/banner-protocol.png
---

自研二进制协议要扛住"省、可切包、可分类、可加密、可演进"五条约束，这些原则听起来抽象，但落到一个真实跑在生产环境的 IM 服务端里，每一条都能在代码里指认到具体的类和字段。这篇文章以飞享IM（FshareIM）服务端 `chat-server-pro` 为例，从源码层面拆解这套自研协议是怎么把上述原则一条条实现出来的：10 字节包头怎么切包、`Signal`/`SubSignal` 两级命令字怎么分发、心跳和 ACK 怎么关联、AES 加密放在协议的哪个环节、版本位怎么预留，以及 TCP 二进制和 WebSocket JSON 这两条通道是怎么在同一个接入层里协同工作的。

![10字节包头，两级命令字：飞享IM 二进制协议实践全解](/img/blog/2026-07-14/banner-protocol.png)

<!--truncate-->

---

## 一、为什么飞享IM 不直接用 HTTP / WebSocket

HTTP 是请求-响应模型，服务端没法主动推消息给客户端；WebSocket 解决了双向通信，但握手要走一次带完整 HTTP 头的 Upgrade、每帧都有帧头开销，对流量和电量敏感的移动端不算最优解。飞享IM 的选择是**分端**：Android 客户端走自研二进制协议（TCP + Protobuf），Web 客户端走 WebSocket（JSON）。两条链路接入同一个 `push-connector` 接入层，共用同一套 `Signal`/`SubSignal` 命令字体系，只是编解码这一层各自实现——这不是纸面上的选型描述，是能在代码里直接指认到的两个独立 handler（第六节详细展开）。

## 二、10 字节包头：省与可切包怎么落地

### 1. 长度前缀怎么解决粘包/拆包

飞享IM 走的是经典的**长度前缀（固定包头 + 变长包体）**方案，实现在每个包类型的基类 `PushPacket` 的 `decode()` 方法里：

```java
// push-common/src/main/java/com/comsince/github/PushPacket.java
public PushPacket decode(ByteBuffer byteBuffer, int readableLength, ChannelContext channelContext) throws AioDecodeException {
    if (readableLength < Header.LENGTH) {
        return null;                      // 连包头都不够，等下一次读事件
    }
    Header header = new Header(byteBuffer);
    if (!header.isValid()) {
        Tio.close(channelContext, "close by invalid signal");
    }
    setHeader(header);
    int bodyLength = header.getLength();
    if (bodyLength < 0) {
        throw new AioDecodeException("bodyLength [" + bodyLength + "] is not right,");
    }
    int neededLength = Header.LENGTH + bodyLength;
    int isDataEnough = readableLength - neededLength;
    if (isDataEnough < 0) {
        return null;                      // 包体还没到齐，同样返回 null
    }
    if (header.getLength() > 0) {
        byte[] body = new byte[header.getLength()];
        byteBuffer.get(body);
        setBody(body);
    }
    return this;
}
```

两处 `return null` 是关键——这是 t-io 框架（`AioHandler` 接口的约定）识别"数据不够，先缓存等下一次读事件"的信号：先保证读到完整包头，再靠包头里的长度字段保证读到完整包体，多余的字节自动留给下一条消息的解析。这样一来，无论 TCP 底层把多条消息拆成几次 `read` 返回，应用层都能准确切出每一条完整的消息边界。

### 2. 10 字节包头字段设计

`push-common/src/main/java/com/comsince/github/Header.java`（`push-sdk/push-nio-sdk` 里有一份逐字节对齐的客户端镜像实现，服务端和 Android 客户端共用同一套包头约定）：

| 偏移 | 长度 | 字段 | 说明 |
|---|---|---|---|
| `[0]` | 1 字节 | `magic` | 固定 `0xF8`，接收端第一时间用它快速甄别合法数据帧 |
| `[1]` | 1 字节 | `version` | 协议版本号，当前为 `2`，为未来的协议升级预留位置（第五节展开） |
| `[2]` | 1 字节 | `signal` | 低 7 位存主信令 `Signal.ordinal()`，高位为将来的标志位预留 |
| `[3-6]` | 4 字节 | `length` | 包体长度，大端 int32，支持最大 2GB 的消息体 |
| `[7]` | 1 字节 | `subSignal` | 低 7 位存子信令 `SubSignal.ordinal()`，与 `signal` 搭配做二级分类 |
| `[8-9]` | 2 字节 | `messageId` | 大端整数，用于请求-响应关联（第四节展开） |

```java
public boolean isValid() {
    return mContents[0] == (byte) 0xf8
        && getLength() >= 0
        && getSignal() != Signal.NONE;
}
```

10 字节定长包头 + protobuf 变长包体，这就是"省"这条约束的具体实现：无论消息内容多复杂，包头本身的开销始终是固定的 10 字节，不会随业务字段增多而膨胀。

## 三、可分类：Signal 与 SubSignal 两级命令字

一条长连接上跑的信令类型很多：鉴权、心跳、握手、消息发布、发布确认……飞享IM 用两级 `enum` 做分类，直接以 `ordinal()` 写入包头对应字节：

```java
// push-common/src/main/java/com/comsince/github/Signal.java
public enum Signal {
    NONE, SUB, AUTH, PING, PUSH, CONTACT,
    CONNECT, CONNECT_ACK, DISCONNECT, PUBLISH, PUB_ACK;
}
```

`Signal` 管的是连接级的大类——鉴权（`AUTH`）、心跳（`PING`）、握手（`CONNECT`/`CONNECT_ACK`）、断连（`DISCONNECT`）、消息发布与确认（`PUBLISH`/`PUB_ACK`）。业务消息的细分放在 `SubSignal` 里，同样是一个 enum，覆盖消息通知（`MN`）、撤回通知（`RMN`）、已读/送达回执（`MRN`）、好友与群相关通知，一直到最新加入的 AI 流式 token 推送（`SAI`）。

包解到内存后，`MessageDispatcher` 按顺序把包交给注册的 `MessageProcessor` 处理：

```java
// spring-boot-dubbo-push-connector/.../process/MessageDispatcher.java
private static List<MessageProcessor> pushMessageProcessors = new ArrayList<>();
static {
    pushMessageProcessors.add(new ImMessageProcessor());
    pushMessageProcessors.add(new HeartbeatResponseProcessor());
}
public static void handleMessage(PushPacket pushPacket, ChannelContext channelContext) {
    for (MessageProcessor pushMessageProcessor : pushMessageProcessors) {
        if (pushMessageProcessor.match(pushPacket)) {
            pushMessageProcessor.process(pushPacket, channelContext);
            return;
        }
    }
}
```

`ImMessageProcessor` 认领 `CONNECT`/`CONNECT_ACK`/`DISCONNECT`/`PUBLISH`/`PUB_ACK` 这几类连接级信令，内部再 `switch` 一次；`PUBLISH` 底下的业务消息则按 `SubSignal.name()` 做二次分发，找到具体的处理器：

```java
// spring-boot-dubbo-push-connector/.../handler/PublishMessageHandler.java
IMHandler handler = m_imHandlers.get(subSignal.name());
if (handler != null) {
    handler.doHandler(clientID, fromUser, subSignal.name(), payloadContent, wrapper, false);
}
```

每个具体的 `IMHandler` 子类用 `@Handler("MN")`、`@Handler("FRN")` 这类注解标注自己认领哪个 `SubSignal`，启动时通过扫描全部 `IMHandler` 实现类自动完成注册。这套"注解 + 扫描"的路由表设计，让新增一种业务消息类型只需要新增一个带注解的处理器类，不用改动分发逻辑本身，也是"可分类"落地时顺带解决的一个扩展性问题。

## 四、心跳与请求-响应关联的具体实现

### 1. 心跳：JSON body + 动态超时

飞享IM 的心跳走 `Signal.PING`，body 是一段轻量 JSON，携带客户端期望的心跳间隔：

```java
// push-common/src/main/java/com/comsince/github/heartbeat/HeartBeatBody.java
public class HeartBeatBody {
    long interval;
    public long getInterval() { return interval; }
    public void setInterval(int interval) { this.interval = interval; }
}
```

服务端收到后，不仅回一个 pong，还会用客户端上报的间隔动态调整这条连接的超时阈值：

```java
// spring-boot-dubbo-push-connector/.../process/HeartbeatResponseProcessor.java
public void process(PushPacket pushPacket, ChannelContext channelContext) {
    HeartBeatBody heartBeatBody = Json.toBean(new String(pushPacket.getBody()), HeartBeatBody.class);
    HeartbeatResponsePacket heartbeatResponsePacket =
        new HeartbeatResponsePacket("ping back next interval " + heartBeatBody.getInterval());
    heartbeatResponsePacket.setMessageId(pushPacket.getHeader().getMessageId());
    channelContext.setHeartbeatTimeout(heartBeatBody.getInterval() + 60 * 1000);
    Tio.send(channelContext, heartbeatResponsePacket);
}
```

这样设计的好处是：不同网络环境、不同电量策略的客户端可以自主决定心跳节奏（弱网环境下拉长间隔省流量，前台活跃时缩短间隔保证实时性），服务端始终按"客户端承诺的间隔 + 60 秒宽限期"来判断连接是否存活，不需要为不同客户端类型写死不同的超时策略。

### 2. 请求-响应怎么对上号：messageId 回声

t-io 框架本身提供 `Tio.bSend` + `SynPacket` 这套原生的同步阻塞发送机制，飞享IM 选择在应用层自己做关联——用包头里的 `messageId` 做请求-响应配对：服务端把收到包的 `messageId` 原样写回 ACK 包，客户端凭这个 ID 判断"我发的哪条消息被确认了"。

```java
// spring-boot-dubbo-push-connector/.../handler/PublishMessageHandler.java
private void sendPubAck(String clientId, int messageID, ByteBuf payload, SubSignal subSignal) {
    PublishAckMessagePacket publishAckMessagePacket = new PublishAckMessagePacket();
    publishAckMessagePacket.setMessageId(messageID);   // 原样回声
    publishAckMessagePacket.setSubSignal(subSignal);
    byte[] messageByte = new byte[payload.readableBytes()];
    payload.readBytes(messageByte);
    publishAckMessagePacket.setBody(messageByte);
    PushUtil.pushMessageByBsId(clientId, publishAckMessagePacket);
}
```

ACK 包体还有一个显式约定：**第一个字节是错误码，后面跟着消息体**，这样客户端解析 ACK 时不需要额外的信令区分"成功"还是"失败"，一个字节就能完成判断。心跳的 pong、`ConnectAckMessagePacket` 都是同一套"回声 messageId"模式，整个协议里请求-响应配对的实现方式是统一的。

这个传输层的 `messageId` 和聊天消息本身的 ID 是两套体系——聊天消息用的是服务端 Snowflake 生成的 64 位全局 ID，配合客户端本地的 `localMessageId` 做断线重连后的消息续传，这一层在此前的《飞享IM核心技术说明》里已经详细讲过，两套 ID 各司其职：`messageId` 管"这次请求有没有被收到"，Snowflake ID 管"这条消息在全局里唯一是谁"。

## 五、可加密：把加密放在最需要的环节

飞享IM 没有对整个包体做无差别加密，而是把 AES 加密聚焦在最敏感的环节——登录鉴权阶段的密码字段：

```java
// push-common/src/main/java/com/comsince/github/security/AES.java
public static byte[] AESEncrypt(byte[] tobeencrypdata, byte[] aesKey) {
    SecretKeySpec skeySpec = new SecretKeySpec(aesKey, "AES");
    Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
    IvParameterSpec iv = new IvParameterSpec(aesKey);
    cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);
    // 加密前会在明文头部拼接一个 4 字节的"距 2018-01-01 的小时数"时间戳，供解密侧做新鲜度校验
    ...
}
```

握手阶段解密登录密码时，用的是每个会话独立的密钥：

```java
// spring-boot-dubbo-push-connector/.../process/ImMessageProcessor.java
pwd = Base64.getDecoder().decode(msg.getPassword());
if (session != null && session.getUsername().equals(msg.getUserName())) {
    pwd = AES.AESDecrypt(pwd, session.getSecret(), true);   // 以会话密钥作为 AES key
}
```

算法是 `AES/CBC/PKCS5Padding`，并且在加密前拼接了一个 4 字节的小时级时间戳，解密侧会校验这个时间戳是否在 24 小时窗口内，相当于给密文加了一层轻量的新鲜度校验，防止密文被截获后长期重放。除此之外，飞享IM 后台管理端还有一套独立的 DES token 方案（`Tokenor` + `DES`），用于生成和校验管理端登录令牌，token 内容里编码了签发时间和用户名，走的是与聊天链路完全隔离的另一套密钥体系。这种"分场景选加密方式、加密范围聚焦在鉴权相关字段"的做法，对应参考文章里"包头明文、包体按需加密"的思路——聊天消息体走 protobuf 紧凑编码本身已经不易被直接理解，真正需要重点保护的是一次性传输、且和账号安全直接挂钩的密码字段。

## 六、可演进：给协议留出的版本位与扩展空间

参考文章里提到"版本号是初版最容易偷懒、最容易在上线后追悔的一环"，飞享IM 在设计之初就把这一步做了：包头 `[1]` 字节固定留给 `version` 字段，当前值为 `2`：

```java
public Header() {
    mContents = new byte[LENGTH];
    mContents[0] = (byte) 0xf8;
    mContents[1] = VERSION;
}
```

这个字段几乎不占体积（1 字节），却是未来新老客户端长期共存时的关键容量——一旦需要引入不兼容的包头变更，服务端可以按这个字节区分不同版本的客户端，分别走不同的解析逻辑，不需要强制所有用户瞬间升级。

`SubSignal` 的扩展方式同样遵循"只增不改"的原则：新增一种业务消息类型时，只需要在枚举末尾追加一个新值、再写一个带 `@Handler` 注解的处理器类，已有的信令值和处理器完全不受影响。像 `SAI`（AI 流式 token 推送）这个较新加入的子信令，就是按这个方式追加到已有体系里的，没有对存量的 `Signal`/`SubSignal` 做任何改动，老客户端不认识这个新值时可以直接忽略，不影响其正常收发已有类型的消息。

## 七、分端实践：TCP 二进制 + WebSocket JSON 协同

`push-connector` 同时跑着两个 t-io handler：一个是纯二进制的 `PushConnectorHandler`（走前面几节说的 `Header` + protobuf body），另一个是 `PushWsServerAioHandler`，继承 t-io 自带的 `WsServerAioHandler`，把同一个内部 `PushPacket` 模型转换成 JSON 文本帧发给 WebSocket 客户端：

```java
// spring-boot-dubbo-push-connector/.../websocket/PushWsServerAioHandler.java
PushPacket pushPacket = (PushPacket) packet;
WebSocketProtoMessage webSocketProtoMessage = new WebSocketProtoMessage();
webSocketProtoMessage.setSignal(pushPacket.signal().name());
webSocketProtoMessage.setSubSignal(pushPacket.subSignal().name());
webSocketProtoMessage.setMessageId(pushPacket.messageId());
webSocketProtoMessage.setContent(
    WsMessageHandler.getInstance().handleResult(pushPacket.signal(), pushPacket.subSignal(), pushPacket.getBody()));
wsResponse = WsResponse.fromText(Json.toJson(webSocketProtoMessage), ShowcaseServerConfig.CHARSET);
```

两条链路共享同一套 `Signal`/`SubSignal` 命令字定义和 `messageId` 语义，业务处理器各自独立实现——二进制侧是按注解扫描的 `IMHandler`，WebSocket 侧是按信令名字符串查表的 `WsImHandler`。这正是"分端不是不统一，是对各自约束的诚实回应"的具体体现：**统一的是协议语义**（同一个 `MN` 通知在两条链路上代表的业务含义完全一致），**不统一的是编解码实现**（Android 端用最省流量的二进制紧凑编码，Web 端用浏览器原生支持、调试成本更低的 JSON），两边各自服务于自己客户端的真实约束。

## 八、五个原则与实现的对照

回到参考文章总结的自研协议五个核心约束，飞享IM 的实现可以对照如下：

| 约束 | 飞享IM 的具体实现 |
|---|---|
| **省** | 10 字节定长包头 + protobuf 变长包体，二进制侧的开销随消息数量线性增长，不随字段复杂度膨胀 |
| **可切包** | `PushPacket.decode()` 的长度前缀方案，两次 `return null` 分别处理"包头不够"和"包体不够"两种半包场景 |
| **可分类** | `Signal` + `SubSignal` 两级命令字，配合注解扫描的处理器注册表，新增消息类型不影响已有分发逻辑 |
| **可加密** | AES 聚焦在登录密码字段，配合 4 字节时间戳做新鲜度校验；管理端 token 走独立的 DES 体系，加密范围和业务敏感度匹配 |
| **可演进** | 包头预留 1 字节 version 位；`SubSignal` 只增不改，新信令类型（如 `SAI`）可以平滑追加而不影响存量客户端 |

这套设计跑在飞享IM 的生产接入层里，同时服务 Android 的 TCP 二进制通道和 Web 的 WebSocket JSON 通道，是"自研协议五要素"从纸面原则落到一个真实项目具体代码的完整样本。
