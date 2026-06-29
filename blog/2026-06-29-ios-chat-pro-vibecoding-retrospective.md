---
title: 12天337提交：用 Vibe Coding 从零构建 iOS IM 客户端的复盘
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [Vibecoding, Claude Code, iOS, Swift, UIKit, IM, 即时通讯, 方法论, 复盘]
---

这是一篇关于「人不看代码、AI 全程执行」的真实工程记录。`ios-chat-pro` 是飞享 IM 的 iOS 原生客户端，用 Swift + UIKit 实现，对接自研 TCP 协议和 protobuf 二进制消息，功能覆盖单聊、群聊、音视频通话、好友管理、群组管理、消息撤回。

**12天，337次提交，从零开始。** 全程对照 Android 端参考实现，由 Claude Code 执行，人负责架构决策、审核与验收。

这篇文章记录哪些方法真正有效，哪些地方走了弯路，以及给下一个想用 Vibe Coding 做真实项目的人的具体建议。

<!--truncate-->

---

## 一、背景：为什么这样做

飞享 IM（FshareIM）已经有了 Java 服务端、Android 客户端和 Vue Web 客户端。iOS 客户端一直缺席。

复用同一套协议是正确选择——服务端不动、协议不改，只是换一个语言的客户端实现。但对我个人而言，Swift 是陌生领域，UIKit 的 AutoLayout、Diffable DataSource、Combine 响应式……每一块都需要学习曲线。

这正是 Vibe Coding 的切入点：**让 AI 承担语言和框架层面的执行，我专注于协议理解、架构决策和质量判断**。

Android 端 `android-chat-pro` 成为唯一的参考基准——协议字段、消息类型、Handler 逻辑，所有不确定的地方都以 Java 源码为准，拒绝猜测。

---

## 二、出发点：先立架构，再动手

### 一张架构图定调全局

第一天没有写任何业务代码，只做了一件事：写完整的迁移架构设计文档。这份文档从协议层开始，逐层向上规划：

```
IMProto         Protobuf 生成代码
IMTransport     TCP 帧传输（NWConnection）
IMClient        连接生命周期：登录握手、心跳、断线重连
IMStorage       SQLite（GRDB）存储：消息/会话/联系人/群组/同步状态
IMMessaging     消息收发：send/receive/recall/notify 各 Handler
IMContacts      好友 & 好友申请同步
IMGroups        群组管理：创建/同步/成员变更
IMMedia         媒体上传：MinIO 预签名 URL
IMCall          WebRTC 音视频通话
IMKit           UIKit-agnostic ViewModels（Combine）
AppCore         依赖容器 AppEnvironment + AppConfig
App             UIKit ViewControllers
```

**依赖方向严格单向。** 这一条约定写进了 `CLAUDE.md`，并在每一次 spec 文档和 plan 文档中重申。12 天下来，这条规则从未被打破。

### 关键设计决策在纸上做，不在代码里做

架构文档里有一张决策表，列出了每个技术选型的选择和理由：

| 维度 | 选择 | 理由 |
|---|---|---|
| UI 框架 | UIKit 为主 | Android 对应物清晰，逐屏对照移植更确定 |
| 架构模式 | MVVM + Combine | ViewModel 层无 UI 依赖，可独立单测 |
| 本地存储 | GRDB.swift | ValueObservation 直接桥接 Combine，零额外通知机制 |
| 依赖管理 | Swift Package Manager | 本地多模块，无 CocoaPods 复杂性 |
| 线程模型 | 无内部锁，全部主队列 | 简化并发模型，代价是调用方必须守约 |

这张表在后续 12 天里反复被引用。每次 brainstorm 一个新功能，首先确认它是否与这些决策冲突。

---

## 三、工作流：Spec → Plan → Execute 的节奏

整个项目按照固定节奏推进：**brainstorm（设计决策）→ 写 spec（设计文档）→ 写 plan（实施计划）→ execute（执行）→ review（审核）**。

12 天里，这个循环重复了 9 次——对应 9 份 spec 文档和 17 份 plan 文档：

```
Phase 1 MVP（6月17–19日）
  Plan A: IMProto + IMTransport    — 帧协议、protobuf 代码生成
  Plan B: IMClient                 — 登录握手、心跳、重连
  Plan C: IMStorage                — GRDB 数据库、5 个 Store
  Plan D: IMMessaging              — 消息收发 Handler 层
  Plan E: AppCore + App Shell      — 依赖容器、登录 UI
  Plan F–H: ContactSync、ConversationList、MediaUpload

Phase 2（6月21–22日）
  Plan K: 好友管理
  Phase 2 群聊

Phase 3（6月23–24日）
  音视频通话（WebRTC + CallKit）

Phase 4（6月25日）
  「我的」Tab

专项改造（6月26–27日）
  输入栏重设计 + 语音/文件消息
  消息撤回
  群信息页重设计
```

### Spec 文档里做什么

spec 文档不是需求说明书，是**决策清单**。它回答三个问题：

1. 这个模块的边界在哪里（职责范围、不做什么）
2. 与现有代码的接口是什么（协议/方法签名级别）
3. 有哪些未确认风险（明确标出，不让风险藏在计划里）

Phase 1 的架构文档里有一节专门列「风险与待确认事项」，共 7 条，其中 AES 握手的字节级对齐方式被标为最高优先级风险——这直接影响是否能建连。这条风险在 Plan B 的第一个任务里就被验证解决：

> **AES/CBC/PKCS7，IV=key，4字节小时戳前缀，原版最高位恒为0的 bug 也原样保留。** 用真实编译运行的 Java `Cipher` 生成密文做交叉验证，不只是自我一致性测试。

### Plan 文档里做什么

plan 文档是给 AI 执行的操作手册。好的 plan 文档有这些要素：

| 要素 | 作用 |
|---|---|
| Task 粒度拆解 | 每个 Task 对应具体文件，有输入有输出 |
| 代码骨架 | 接口定义、关键方法签名，AI 填实现而非从空白猜 |
| 验证命令 | `swift test --filter XxxTests` 可运行的检查 |
| 完成标准 | 「构建通过」比「看起来对」精确得多 |

Plan A（IMProto + IMTransport）示例——Task 5 的任务描述精确到「实现 `FrameDecoder` 状态机，输入 `Data`，输出 `[Frame]`，处理粘包/半包/一次多帧」，并附了接口骨架和测试用例的输入输出。

AI 按这个模板实现的 `FrameDecoder`，首次提交后测试全绿，没有来回修改：

```swift
public func feed(_ data: Data) -> [Frame] {
    buffer.append(contentsOf: data)
    var frames: [Frame] = []
    while true {
        guard buffer.count >= Header.length else { break }
        guard let header = Header.decode(Data(buffer.prefix(Header.length))) else {
            // 魔术字节错误：流已失步，丢弃全部缓冲
            buffer.removeAll()
            break
        }
        let totalLength = Header.length + Int(header.bodyLength)
        guard buffer.count >= totalLength else { break }
        let body = Data(buffer[Header.length..<totalLength])
        frames.append(Frame(header: header, body: body))
        buffer.removeFirst(totalLength)
    }
    return frames
}
```

`[UInt8]` 而非 `Data` 的选择也在 plan 里提前说明了原因——`Data` 切片后 `startIndex` 不保证为 0，绝对偏移计算不安全。这种细节写进 plan，执行阶段零争议。

---

## 四、协议层：逐字节移植的方法论

### 不要猜，对着源码算

iOS 端的每一个协议细节都以 Android Java 源码为准，不靠推断：

- 二进制帧头：10 字节固定头，Magic `0xf8`，Signal/SubSignal 枚举序号与 Java 端一一对应
- AES 握手：CBC 模式，PKCS7 padding，IV = key，4字节小时戳前缀——这些细节直接从 `AES.java` 逐行读取
- 心跳算法：`HeartbeatManager` 是 Java `HeartbeatManager` 的逐行移植，包括毫秒单位的计算、白天/夜间上限区分、随机抖动逻辑

```swift
/// Byte-for-byte port of cn.wildfirechat.proto.HeartbeatManager's
/// adaptive heartbeat-interval algorithm. All durations are milliseconds (Int64),
/// matching the Java long arithmetic exactly.
public final class HeartbeatManager {
    public static let oneStepInterval: Int64 = 5_000
    public static let minHeartbeatInterval: Int64 = 30_000
    // ...
}
```

注释里写明「byte-for-byte port」不是为了炫技，而是为了明确这段代码不允许「优化」——任何偏离都可能造成客户端与服务端行为不一致。

### 用真实密文做交叉验证

AES 握手是高风险点。光在 iOS 端做「加密后解密回来一致」的自我验证不够——需要和真实的 Java 端密文做交叉对比。

具体做法：在 Plan B 的测试夹具里直接嵌入一段用真实 Java `Cipher` 生成的密文，Swift 端 `WireCrypto` 解密后断言明文内容与预期一致：

```swift
// Java 端用相同 key + token 生成的密文
let javaCiphertext: [UInt8] = [0x3f, 0xa2, ...]
let decrypted = WireCrypto.decrypt(javaCiphertext, key: testKey)
XCTAssertEqual(decrypted, expectedPlaintext)
```

这一步在 Phase 1 第一天完成，直接消除了「建连握手失败但不知道为什么」的最大风险。

---

## 五、数据流：GRDB + Combine + ViewModel

整个 UI 层的数据流没有额外的通知机制，靠 GRDB 内置的 `ValueObservation` 直接驱动：

```
NWConnection 收帧 → IMClient 分发 → MessageHandler 写 GRDB
  → ValueObservation 触发变更通知
  → IMKit ViewModel 桥接为 Combine Publisher → @Published 更新
  → ViewController sink → reload UI
```

`ConversationListViewModel` 中，观察会话表的方式如下：

```swift
IMStorage.shared.conversationStore
    .conversationsPublisher()   // GRDB ValueObservation → Combine
    .receive(on: DispatchQueue.main)
    .sink { [weak self] conversations in
        self?.conversations = conversations
    }
    .store(in: &cancellables)
```

没有 `NotificationCenter`，没有自定义 delegate，没有手工刷新调用。数据写入数据库，UI 自动跟上。这个设计在整个 12 天里没有修改过一次，是整个项目中最稳定的部分。

### 依赖容器：AppEnvironment

所有长生命周期服务都由 `AppEnvironment` 持有，`SceneDelegate` 在启动时构建它，所有 ViewController 通过构造参数或闭包接收所需服务——没有单例，没有全局状态：

```swift
public final class AppEnvironment {
    public let storage: IMStorage
    public private(set) var imClient: IMClient?
    public private(set) var messagingService: MessagingService?
    public private(set) var callManager: CallManager?
    // ...

    @discardableResult
    public func connectIfPossible() -> Bool {
        guard imClient == nil else { return true }
        guard let credentials = credentialsStore.load() else { return false }
        // 构建 IMClient，注册所有 Handler，触发建连
    }
}
```

这个设计让测试和后续替换都很容易——`IMClient` 有 `FakeTransportConnection` 测试替身，`HeartbeatManager` 有 `ManualScheduler` 注入点，不需要真实网络就能测协议逻辑。

---

## 六、踩坑集锦：那些让人抓狂的地方

### 坑 1：UIKit AutoLayout 的约束地雷

UIKit 的 Auto Layout 是整个项目 fix 提交最集中的来源。最典型的一个：

> `fix(TextMessageCell): 修复进入聊天界面崩溃（约束无共同祖先）`

这类 crash 的特征是「运行时才炸，静态代码看不出来」。问题出在把一个还未加入视图层级的 subview 的约束，与另一个 view 的约束绑定在了一起——编译通过，运行直接崩。

类似的 AutoLayout 坑在 12 天里触发了不止一次：

- EmojiPanelView 的 `safeAreaLayoutGuide` 用法导致约束警告 + UI 抖动
- 输入栏 `panelContainer` 与 `safeArea` 的 pin 方向写反
- `ActionCell` 的圆形图标容器用 `layer.cornerRadius` 但没有固定 48×48 尺寸约束

**教训**：UIKit 布局代码的每一处尺寸约束，都要在 plan 文档里明确写出用 `frame` 还是 AutoLayout，pin 到哪个视图，是否涉及 safeArea。模糊描述留给 AI 自由发挥，就会产生这类运行时炸弹。

### 坑 2：Diffable DataSource 的唯一性陷阱

> `fix(Chat): make timeHeader uniquely identified by anchorId to prevent diffable snapshot crash on re-login`

`UICollectionViewDiffableDataSource` 要求每个 item 的标识符在 snapshot 里全局唯一。时间分隔行的标识符最初直接用时间戳，重新登录后历史消息重新加载，同一个时间戳出现了两次——diffable snapshot apply 时直接 crash。

修复很简单：用相邻消息的 messageId 作为时间分隔行的 anchorId。**但这个坑的代价是「只有切换账号才能复现」**——普通测试流程走不到，只有在验收「断线重连不丢消息」时才暴露。

**教训**：Diffable DataSource 的 item 标识符设计，必须在 plan 文档里明确说明唯一性来源，不能依赖业务数据的「事实上不重复」——账号切换、重新登录、分页加载合并，任何一种场景都可能破坏这个假设。

### 坑 3：GRDB 重入崩溃

> `fix(IMMessaging): 修复切换账号登录后拉取历史消息可能触发的 GRDB 重入崩溃`

GRDB 不允许在一个数据库写事务里触发另一个写操作（即使通过间接调用）。切换账号时，旧的消息拉取流程还在跑，清库操作（logout 触发）与正在进行的写入发生了重入——直接 fatal。

这类问题在单线程模型里特别隐蔽：**不是真正的多线程竞争，而是同步调用链上的意外重入**。连接断开 → 触发清库 → 清库期间回调了还未完成的 ReceiveMessageHandler → 它又尝试写库。

**教训**：无内部锁的线程模型是一把双刃剑。简单场景下一切顺畅，但调用链一旦有回调嵌套，重入风险就出现了。在 plan 文档里明确标出「这个方法会被回调调用」的所有路径，才能提前规避。

### 坑 4：图片缩略图超出服务端 BLOB 限制

> `fix(Chat): compress image thumbnail to stay under server BLOB limit`

图片消息发送时，protobuf 消息体里嵌入了缩略图。Android 端对缩略图做了压缩（限制字节数），iOS 端最初没有——图片稍大时服务端拒绝写入，发送失败但没有明确报错，消息只在本地停在「发送中」。

这个 bug 的诊断需要同时看服务端日志和 iOS 端的 PUB_ACK 处理路径，纯看 iOS 代码找不到原因。

**教训**：服务端对消息体有隐式大小约束，这类约束应该在 spec 文档里从 Android 实现里提前摘录，不能等发现问题再查。

### 坑 5：头像 Loader 没有共享实例

> `fix(Chat): 共享 AvatarLoader 实例消除头像重复网络请求`

消息列表里每个 Cell 都需要加载发送方头像。最初的实现是每个 Cell 单独持有一个 `AvatarLoader`——同一个用户的头像在同一屏里可能被并发请求 10 次。

修复方式是把 `AvatarLoader` 提升为由 `ConversationViewModel` 持有的共享实例，所有 Cell 复用同一个加载队列和缓存。

**教训**：资源共享策略（缓存、连接池、加载队列）应该在 plan 文档里作为架构要素明确，而不是在实现阶段各 Cell 各自为政。

---

## 七、哪些地方 AI 帮上了忙

### 跨文件重构

当一个接口签名变更需要同时修改 8 个文件时，AI 的价值最大。比如 `IMKit` 里 `MessagingService` 的 protocol 新增方法时，所有 conformer（`MessagingServiceImpl`、`MockMessagingService`）和所有调用点需要同步更新，AI 能一次性处理完，人工做容易遗漏。

### 按照 Android 源码逐字移植

心跳算法 `HeartbeatManager`、重连退避算法、`RoundRobinHostSelector`——这些都是确定性很强的算法移植任务。给 AI 看 Java 源码，告诉它「用 Swift 逐行移植，保持毫秒单位的 Int64 精度，不要优化」，输出质量很高，配上单测验证逻辑正确性。

### 构建测试夹具

给定协议文档和输入输出例子，AI 生成 XCTest 覆盖各种边界情况（TCP 粘包、半包、跨帧、空帧）的速度比手写快很多。整个 `IMTransport` 的测试覆盖在一个 Task 内完成。

### 生成重复性代码

`StoredMessage`、`StoredConversation`、`StoredGroup`——每个都需要 `FetchableRecord`、`PersistableRecord`、`Codable` conformance，加上 column 定义和迁移代码。模式固定，AI 生成后人工 review 一遍即可。

---

## 八、哪些地方人必须亲自判断

### 架构决策

「单队列无锁还是用 actor？」、「GRDB ValueObservation 还是手工 delegate 通知？」、「AppEnvironment 还是 ServiceLocator 单例？」——这些决策的后果会传导到整个项目，AI 的建议只能作为参考，决策权必须在人这里。

### Bug 的根因诊断

上面列的每一个坑，AI 可以提出几个可能方向，但真正定位「Diffable DataSource crash 是因为 timeHeader 没有唯一 anchorId」，需要人理解「账号切换这条特殊路径下历史消息的加载时序」，纯靠 AI 推理很难直接命中。

### UI 视觉判断

气泡圆角是 12 还是 14？输入栏高度是 48 还是 52？这类判断 AI 只能给出建议，最终要靠眼睛。更重要的是「这个界面和 Android 端对齐了吗？」——这需要人拿两台手机并排看，不是代码 diff 能替代的。

### 验收标准

「功能 X 完成了吗？」不等于「测试通过了」。真正的验收是：在真实账号下，iOS 和 Android 互发消息，检查消息时序、未读角标、断网重连后消息是否完整——这个过程必须是人来做。

---

## 九、不如人意之处：批评与反思

### 反思一：Plan 文档里 UI 细节描述太模糊

Phase 1 的 plan 文档对协议层（IMTransport/IMClient）的描述非常精确，有接口骨架、有测试夹具、有字节级约束。但到了 UI 层（ConversationViewController、输入栏），描述往往是「实现一个类似 Android 的输入栏」——这给了 AI 太多发挥空间，结果是初版实现离预期有偏差，需要多轮修改。

**建议**：UI 层的 plan 文档应该包含具体的视图层级描述（哪个 view 包含哪些 subview），关键约束（输入栏固定在 safeArea bottom，高度自适应但最小 48pt），以及与 Android 截图的对应关系。越具体，第一次执行越接近目标。

### 反思二：日志设施推迟太久

Phase 1 架构文档里明确列出了风险第 7 条：

> `IMClient`/`IMTransport`/`IMProto` 目前没有任何日志设施——遇到异常数据时静默丢弃，无法追踪。

这条风险当时标了「Plan C/D 前必须补」，但实际执行时被推迟了。真机调试连接问题时，只能靠临时加的 `print("[DEBUG-FP]...")` 来看帧流，这些调试日志一直留到了最后：

```swift
print("[DEBUG-FP][\(timestamp)] FrameDecoder.feed: +\(data.count) bytes, buffer now \(buffer.count) bytes")
```

**建议**：日志设施和错误上报应该在 Phase 1 的第一个 plan 里就作为独立 Task 实现，不要等到「需要的时候再加」。加日志的时间往往在你最需要它的时候——也就是最没空加它的时候。

### 反思三：测试覆盖集中在协议层，UI 层几乎是空白

9 个测试模块里，`IMTransportTests`、`IMClientTests` 覆盖率最高，`IMStorageTests`、`IMMessagingTests` 也有覆盖。但 `App` target 的 ViewController 层几乎没有自动化测试，所有 UI bug 都靠手工发现。

这导致上面列的那些 UIKit 坑（约束崩溃、Diffable DataSource 问题）在提交后才发现。

**建议**：对于 UIKit 项目，ViewController 的全量单测确实成本高，但关键路径（发送消息、接收消息、切换账号）的 ViewModel 层测试应该在 plan 里作为必须项，不是可选项。`IMKit` 有 Combine ViewModel，测试成本并不高。

### 反思四：Spec 与实现之间的漂移

随着迭代推进，有些模块的实际实现与最初 spec 文档的描述有了偏差。比如 Phase 2 群聊的 spec 里规划了 `IMGroups` 独立处理群同步，但最终实现里部分同步逻辑被放在了 `AppEnvironment.connectIfPossible()` 里——spec 没有更新。

**建议**：每次实现与 spec 有重大偏离时，必须更新 spec。文档与代码的漂移会在后续的 brainstorm 里造成困惑——「文档说是 A，代码是 B，到底哪个对？」。

### 反思五：CLAUDE.md 应该在第一天就写好

`CLAUDE.md` 在 6 月 27 日才提交（`docs: 添加 CLAUDE.md 和 README.md`），而项目从 6 月 17 日就开始了。这意味着前 10 天，每次新的 Claude Code 会话都需要在对话开头重新交代一遍「这是什么项目、架构是什么、约定是什么」。

**建议**：`CLAUDE.md` 应该在写完第一份架构设计文档后立刻创建，至少包含：模块架构图、依赖方向约定、构建命令、语言约定（比如「所有回复使用中文」）。

---

## 十、可复用的方法论提炼

12 天下来，真正起作用的方法论可以提炼成几条：

**1. 用现有参考实现代替从零设计**

对于移植类项目，Android/Java 端是最好的 spec 来源。协议字段、算法逻辑、枚举序号——直接读源码，不靠文档推断。这把最难的协议对齐问题从「不确定」变成了「确定但繁琐」，AI 最擅长处理的就是「确定但繁琐」的任务。

**2. 风险优先，不要把风险压到执行阶段**

每份 spec 里都有「风险与待确认事项」一节。AES 握手细节是最高风险，所以 Plan B 的第一个 Task 就是验证它。**最高风险项最先解决，避免做了一半发现根基不对。**

**3. 计划文档的精度决定执行的精度**

协议层的 plan 精度高（有字节级接口、有测试夹具），执行质量高、修改次数少。UI 层的 plan 精度低（描述模糊），执行质量低、修改次数多。**投入在 plan 文档上的时间，在执行阶段会加倍返还。**

**4. 架构约定写进 CLAUDE.md，不靠记忆传递**

「无内部锁，全部主队列」、「依赖方向严格单向」、「IMStorage 不暴露裸 DatabaseQueue」——这些约定必须写进文件，不能靠对话上下文传递。AI 没有跨会话记忆，每次新会话都从文件读起。

**5. 每天保持代码可工作状态**

337 个提交里，没有一天是「提交了半成品」的状态。每个 Task 完成才提交，每次提交后 `swift build` 通过。这不是仪式感，而是实际需要——AI 执行下一个 Task 时需要编译通过的基础，否则会把上一个 Task 的编译错误带入下一个 Task 的修改里。

---

## 十一、开源说明与后续计划

`ios-chat-pro` 现已开源：

**[github.com/fshare/ios-chat-pro](https://github.com/fshare/ios-chat-pro)**

### 主要功能

- 单聊 & 群聊：文字、图片、语音、文件，支持消息撤回
- 音视频通话：基于 WebRTC（stasel/WebRTC@149.0.0），集成 CallKit
- 联系人管理：好友搜索、好友申请、通讯录同步
- 群组管理：创建群组、成员管理、群公告、群二维码、收藏群
- 主题切换：浅色 / 深色 / 跟随系统
- 本地全文搜索：消息内容搜索

### 运行方式

```bash
git clone https://github.com/fshare/ios-chat-pro.git
cd ios-chat-pro
bash Scripts/generate-xcodeproj.sh   # 生成 Xcode 工程
open ios-chat-pro.xcodeproj
```

对接飞享 IM 生产服务器，可以直接用已有账号测试。切换自部署服务器只需修改 `Sources/AppCore/AppConfig.swift` 里的一处配置。

### 相关项目

- [chat-server-pro](https://github.com/fshare/chat-server-pro) — Java 服务端（push-connector / push-group / push-api）
- [android-chat-pro](https://github.com/fshare/android-chat-pro) — Android 客户端（本文的参考基准）
- [vue-chat-pro-claude](https://github.com/fsharechat/vue-chat-pro-claude) — Vue 3 Web 客户端

### 后续迭代方向

- APNs 推送（需服务端小幅适配，已在架构文档里规划）
- 频道/订阅号功能
- 全局搜索增强
- iPad 适配与多窗口支持

项目会持续迭代，欢迎 star 关注或提 issue。

---

## 结语

12 天，337 次提交，一个 Swift 初学者（对这个领域而言）完成了一个功能完整的 iOS IM 客户端。

**AI 做了什么**：按照计划执行代码；逐字节移植协议算法；跨文件重构；填充重复性结构代码；生成测试夹具。

**人做了什么**：读懂 Android 参考实现；做架构决策；写精确的 plan 文档；判断 UI 细节是否与预期一致；诊断 bug 根因；把控验收标准。

Vibe Coding 的核心不是「让 AI 写代码」，而是**「把执行边界划清楚，然后给 AI 一个足够精确的操作手册」**。

计划越精确，执行越顺畅。决策权留在人这里，执行权才能放心交出去。
