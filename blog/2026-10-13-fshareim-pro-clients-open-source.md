---
title: 四端客户端、470次 AI 协作提交：飞享IM Pro 版客户端全面开源
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [开源, IM, 即时通讯, Android, iOS, Electron, Vue, Vibecoding, Claude Code]
image: /img/blog/2026-10-13/desktop.png
---

今天，飞享IM 正式宣布：**Android、iOS、PC 桌面端、Web 端四个 Pro 版客户端全部开源**。这个决定不是心血来潮。在 AI 的帮助下，逆向一个客户端的成本已经低到可以忽略，闭源客户端的护城河几乎不存在了；而这四个客户端本身也是在 AI 的深度参与下开发出来的，仅 AI 协作提交就有 470 次。既然取之于开源社区和 AI 工具，开源回馈社区也是顺势而为。

<!--truncate-->

---

## 一、为什么开源

### 1. AI 时代，闭源客户端已经守不住什么

客户端代码天生就是"分发到用户手里"的东西：Android 的 APK 可以反编译成 smali 甚至接近原始的 Java，Electron 应用的 `asar` 解包后就是 JavaScript，Web 端的打包产物直接躺在浏览器里，iOS 的二进制也挡不住有心人的分析。

过去，代码混淆和打包压缩至少能抬高逆向的门槛——读懂几万行反编译出来的代码要花大量时间。**但在 AI 的加持下，这个门槛几乎被抹平了**：把一段混淆后的代码丢给大模型，变量还原、逻辑梳理、协议推断几分钟就能完成。对客户端而言，"闭源"能保护的东西已经越来越少。

与其花精力去守一扇已经关不住的门，不如把门打开。

### 2. 开源让功能发布更快

飞享IM 有四个客户端，每个新功能都要在四端各实现一遍，比如前段时间的[多端设置同步](/blog/2026/08/14/user-setting-sync-four-ends-retrospective)。闭源意味着所有的问题都要自己发现、自己修复。开源之后：

- 问题可以由使用者直接通过 Issue 反馈，甚至直接提交 PR 修复；
- 想基于飞享二次开发的团队，可以直接拿代码改，不用再来回沟通；
- 我们自己也不需要再维护"对外版"和"内部版"两套分支，**新功能写完就能发布**。

### 3. 本就是 AI 开发的，回馈社区顺理成章

这四个 Pro 版客户端有一个共同点：**它们的大部分功能都是借助 AI（主要是 Claude Code）开发出来的**。iOS 客户端从零起步，[12 天完成了 337 次提交](/blog/2026/06/29/ios-chat-pro-vibecoding-retrospective)；Vue 3 Web 端和 Electron 桌面端是用 AI 从旧版本整体重构而来；老牌的 Android 客户端也在今年用 AI 持续迭代，发布到了 2.0 版本。

我们用的是开源社区的框架、开源的 AI 工具链，也从社区里学到了大量 Vibe Coding 方法论。把成果开源出来，是理所当然的事。

## 二、开源仓库一览

| 客户端 | 仓库 | 技术栈 | 当前版本 |
|---|---|---|---|
| Android | [fsharechat/android-chat-pro](https://github.com/fsharechat/android-chat-pro) | Java、自研 NIO TCP 协议栈、WebRTC | 2.0.15 |
| iOS | [fsharechat/ios-chat-pro](https://github.com/fsharechat/ios-chat-pro) | Swift、UIKit、GRDB、WebRTC、CallKit | — |
| PC 桌面端 | [fsharechat/electron-vue-chat-pro](https://github.com/fsharechat/electron-vue-chat-pro) | Electron 35、Vue 3、TypeScript、electron-vite | 1.7.2 |
| Web 端 | [fsharechat/vue3-chat-pro](https://github.com/fsharechat/vue3-chat-pro) | Vue 3、TypeScript、Vite、Pinia、Naive UI | 1.2.6 |

四个客户端共享同一个服务端、同一套账号体系，消息、联系人、群组、通话记录在四端之间实时同步。

## 三、各端简介

### 1. Android：android-chat-pro

<div style={{display: "flex", gap: "16px", alignItems: "flex-start"}}>
  <img src="/img/blog/2026-10-13/android.png" alt="飞享IM Android 客户端会话列表" style={{width: "360px", maxWidth: "calc(50% - 8px)"}} />
  <img src="/img/blog/2026-10-13/android-conversation.png" alt="飞享IM Android 客户端聊天界面" style={{width: "360px", maxWidth: "calc(50% - 8px)"}} />
</div>

*Android 客户端 2.0.15：会话列表与聊天界面*

飞享最早的客户端，也是历史最长的一个，最早的提交可以追溯到 2020 年。

- **自研 Java NIO 协议栈**：`push-sdk` 模块基于 Java NIO 实现异步 TCP 长连接，配合自定义的二进制帧协议和自适应心跳算法，解决移动网络下的保活与断线重连问题；
- **多集群节点切换**：内置多个 IM 节点，支持自动轮询和手动切换；
- **完整的 IM 能力**：单聊、群聊、图片 / 语音 / 视频 / 文件 / 位置消息、消息撤回与转发；
- **音视频通话**：基于 WebRTC 的一对一和多人音视频通话，可以与 iOS、PC、Web 端互通；
- **厂商推送**：集成了小米、华为、魅族的系统级推送；
- **自动化发版**：打 tag 即可触发 GitHub Actions 构建并发布 APK。

### 2. iOS：ios-chat-pro

<div style={{display: "flex", gap: "16px", alignItems: "flex-start"}}>
  <img src="/img/blog/2026-10-13/ios.png" alt="飞享IM iOS 客户端会话列表" style={{width: "360px", maxWidth: "calc(50% - 8px)"}} />
  <img src="/img/blog/2026-10-13/ios-conversation.png" alt="飞享IM iOS 客户端聊天界面" style={{width: "360px", maxWidth: "calc(50% - 8px)"}} />
</div>

*iOS 客户端：深色模式下的会话列表与聊天界面*

2026 年 6 月从零开始、完全用 Vibe Coding 方式开发的原生 iOS 客户端，是四个仓库中 AI 参与程度最深的一个。

- **Swift + UIKit**，最低支持 iOS 15；
- **分层模块化**：核心逻辑拆分为 `IMProto`、`IMTransport`、`IMClient`、`IMStorage`、`IMMessaging`、`IMGroups`、`IMCall` 等 Swift Package 模块，每个模块都有独立的单元测试，`swift test` 即可运行；
- **NWConnection + Protocol Buffers** 实现 TCP 自定义帧协议，与 Android 端使用同一套二进制协议；
- **GRDB** 本地持久化，支持增量消息同步；
- **WebRTC + CallKit**：音视频通话接入系统通话界面；
- 浅色、深色和跟随系统三种主题。

### 3. PC 桌面端：electron-vue-chat-pro

![飞享IM PC 桌面客户端](/img/blog/2026-10-13/desktop.png)

*PC 桌面端：AI 机器人推送的纳斯达克盘后日报*

基于 Electron 35 + Vue 3 + electron-vite 构建的跨平台桌面客户端，支持 macOS、Windows 和 Linux。

- **现代安全架构**：开启 `contextIsolation`，渲染进程只能通过 preload 暴露的 `contextBridge` 接口与主进程通信；
- **桌面端专属能力**：自定义无边框标题栏、系统托盘（新消息时图标闪烁）、`Ctrl+Alt+Z` 全局截图并支持标注、拖拽文件发送；
- **大列表性能优化**：消息列表虚拟化，详见[消息列表虚拟化复盘](/blog/2026/07/13/message-list-virtualization-methodology)；
- **AI 消息支持**：Markdown 渲染、流式输出，可以直接和 IM 里的 AI 机器人对话；
- **完整的工程化**：Vitest 单元测试，GitHub Actions 自动构建并发布三个平台的安装包。

### 4. Web 端：vue3-chat-pro

![飞享IM Web 客户端](/img/blog/2026-10-13/web.png)

*Web 端：浏览器打开 web3.fsharechat.cn 即可使用*

把原来的 Vue 2 Web 客户端用 AI 整体重写为 Vue 3 + TypeScript 版本，也是 PC 桌面端的前身。

- **Vue 3 Composition API + Pinia**，Naive UI 组件库；
- **JSON-over-WebSocket 协议**：连接、重连、心跳（25 秒 PING/PONG）、标签页切回前台时自动重连；
- 每个服务端子信令对应一个独立的 Handler，协议常量和服务器地址集中在 `src/constant/index.ts`，**改服务器地址只需改这一个文件**；
- 支持 MinIO 和七牛两种文件上传方式；
- 浏览器打开即可使用，适合快速体验和嵌入现有系统。

## 四、开源仓库里还有什么

除了代码本身，四个仓库里还保留了**完整的 AI 开发痕迹**：

- **`CLAUDE.md`**：每个仓库都有一份写给 AI 编码代理的项目说明，包括构建命令、架构分层、关键约定和踩过的坑。AI 进入项目时会先读这份文件，熟悉项目的上下文；
- **`docs/superpowers/`**：用 Superpowers 工作流产出的设计文档（specs）和实现计划（plans），四个仓库合计 80 多份，记录了一个功能从需求澄清、方案设计到任务拆分的全过程。

对于想学习 Vibe Coding 的开发者来说，这部分可能比代码本身更有价值：**你能看到的不只是最终结果，还有 AI 是怎么一步步把它做出来的。**

## 五、如何使用

1. **直接体验**：克隆任意一个仓库，按照 README 编译运行即可，默认连接飞享官方服务；
2. **私有化部署**：服务端部署可以参考本站的[部署文档](/docs/introduction)。部署好后修改客户端中的服务器地址就能对接自己的服务，各端的配置位置分别是：
   - Android：`chat/src/main/java/cn/wildfire/chat/app/Config.java`
   - iOS：`Sources/AppCore/AppConfig.swift`
   - PC / Web：`src/constant/index.ts`（PC 端位于 `src/renderer/src/constant/index.ts`）
3. **参与贡献**：欢迎提交 Issue 和 PR。如果你也在用 AI 写代码，可以先让你的 AI 读一读仓库里的 `CLAUDE.md`。

## 六、写在最后

开源不是终点。AI 改变了软件被构建的方式，也改变了代码的价值：**代码本身越来越容易获得，真正有价值的是持续迭代的能力和围绕产品形成的社区**。

飞享IM 会继续以开源的方式迭代这四个客户端，也会继续在本站分享 AI 辅助开发的实践与复盘。如果这些代码对你有帮助，欢迎去 GitHub 点一个 Star。
