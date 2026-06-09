---
title: 用 Claude Code Vibe 一个 IM 项目重构：7天64提交背后的方法论
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [Vibecoding, Claude Code, Vue3, TypeScript, 重构, IM, AI编程, 方法论]
---

本文记录了将 `vue-chat-pro`（Vue 2 + Vuex + JavaScript）重构为 `vue-chat-pro-claude`（Vue 3 + Pinia + TypeScript + Vite）的完整历程。7天，64次提交，从零开始建出一个功能完整的即时通讯客户端。这不是一篇"AI 生成代码"的展示文，而是一份关于**如何与 AI 协作完成真实工程任务**的方法论总结。

<!--truncate-->

---

## 一、什么是 Vibecoding

"Vibecoding" 这个词出现在 2025 年，最初描述的是一种与 AI 协作写代码的方式：开发者描述意图，AI 实现细节，人类负责判断和决策，AI 负责执行。

听起来很美好，但实践中大多数人遇到的都是这样的问题：

- 让 AI 直接写功能，结果和期望差很远
- AI 写的代码能跑，但结构乱、难维护
- 同一个问题反复问，AI 每次给的答案都不一样
- 项目稍大一点，AI 就开始"失忆"，不记得之前的决策

这些问题的根源不在于 AI 不够强，而在于**协作方式不对**。

Vibecoding 的本质是一种分工：

- **人类**：负责架构决策、技术选型、分阶段计划、质量判断
- **AI**：负责代码实现、文件操作、跨文件重构、细节填充

理解这个分工之后，Claude Code 就不再是"帮你写代码的工具"，而是**执行你设计好的计划的得力执行者**。

本文就是这个方法论的完整案例记录。

---

## 二、出发点：摸清旧项目，再开口说话

### 旧项目是什么样的

源项目 `vue-chat-pro` 是一个运行了数年的 Vue 2 项目。技术栈的主要问题：

- **Vue 2 + Vuex**：Composition API 不可用，所有状态靠 `vuexStore.dispatch` 字符串命令触发
- **纯 JavaScript**：WebSocket 协议层有 50+ 个文件，零类型约束
- **WebSocket 层与 Vuex 强耦合**：每个 Handler 都直接调用 `vuexStore.dispatch('xxx', payload)`，根本无法独立测试

要迁移到 Vue 3，这三个问题必须逐一击破。

### 先探索，再动手

Vibecoding 的第一步不是写代码，而是**读懂现有代码**。用 Claude Code 的 Explore agent 快速定位关键文件：

```bash
# 找所有调用 vuexStore.dispatch 的地方
grep -r "vuexStore.dispatch" src/

# 找 WebSocket Handler 的文件清单
ls src/websocket/handler/

# 确认有哪些 Vuex module
ls src/store/modules/
```

在这个阶段，你不需要 AI 写任何代码，只需要它帮你**梳理事实**：WebSocket 层有多少个 Handler、Vuex 有哪些 action、哪些文件之间存在循环依赖。

这些问题探索清楚之后，才能做出合理的迁移决策。

### 脑暴环节：把模糊意图变成清晰决策

不要直接告诉 AI "把这个项目从 Vue 2 迁移到 Vue 3"。这个需求太模糊，AI 会给你一个通用的迁移方案，和你的实际情况未必匹配。

正确的做法是带着**具体问题**来脑暴：

> "旧项目的 WebSocket Handler 层直接调用 `vuexStore.dispatch`。新项目用 Pinia。我不想把 WebSocket 层完全重写，只想把 Vuex 依赖换掉。有什么方案？"

脑暴的产出是**决策列表**，不是代码：

| 决策 | 选择 | 理由 |
|------|------|------|
| 状态管理 | Pinia Composition API setup 风格 | 更接近 Vue 3 惯用法，类型推导更好 |
| WebSocket 层迁移策略 | 保留业务逻辑，仅替换 Vuex 依赖 | 协议层稳定，不引入新风险 |
| TypeScript 迁移策略 | `@ts-nocheck` 先行，后期收紧 | 让项目先跑起来，避免阻塞 |
| 主题系统 | CSS 变量双主题，从第一天开始 | 后期改主题代价极高，早做早省事 |
| UI 组件库 | Naive UI + 自定义 CSS 变量 | 与 Vue 3 兼容好，主题定制灵活 |

这张表就是后续所有工作的决策基础。它不长，但每一行都意味着你**主动做了一个选择**，而不是让 AI 帮你选。

---

## 三、制定计划：AI 最喜欢的工作方式

### 为什么要先写计划

直接告诉 AI "开始迁移"，结果是：AI 会从某个它认为合理的地方开始，可能是登录页，可能是路由，可能是某个 Store。后续的工作可能因为依赖关系全部乱掉。

有计划则不同。计划文档的本质是**将对话上下文固化为可检查的执行规格**：

- 每个 Task 有明确的输入文件和输出文件
- 每个步骤有代码模板（不是让 AI 从头想，而是填格子）
- 每个阶段有完成标准（"构建通过"比"看起来对"精确得多）

### Phase 1 计划：1959 行，11 个 Task

第一阶段计划文件覆盖了从脚手架到 WebSocket 层迁移完成的全部工作：

```
Task 1:  初始化 Vite + Vue3 + TypeScript 脚手架
Task 2:  建立 CSS 变量双主题系统
Task 3:  迁移静态资源
Task 4:  迁移 WebSocket model / future / store 层（14+3 个文件）
Task 5:  迁移 WebSocket utils / message / notification 层
Task 6:  迁移 35 个 WebSocket Handler 文件
Task 7:  迁移 VueWebSocket 核心，接入 StoreDispatcher
Task 8:  迁移 WebRTC 层（8 个文件）
Task 9:  实现 7 个 Pinia Store
Task 10: 实现 Vue Router 4（含登录鉴权守卫）
Task 11: 接入 main.ts 和 App.vue
```

计划里每个 Task 不只是任务描述，还有**完整的代码模板**。比如 Task 1 直接给出了完整的 `package.json`，Task 7 给出了 `StoreDispatcher` 的接口定义和替换前后的代码对比。

这样做的好处：AI 执行时不需要"猜"你要什么，直接按模板实现，精准度大幅提升。

### Phase 2 计划：2253 行，12 个 UI 组件 Task

每个 UI Task 里都有一个关键子步骤：**先调用 `frontend-design` skill，给出设计 brief，再开始写代码**。

```markdown
## Task 1: LoginPage.vue

- [ ] Step 1: 调用 frontend-design skill

Brief: "Login page for a chat app. Dark/light theme via CSS variables.
Full-screen centered card, Naive UI components. Discord dark aesthetic."

- [ ] Step 2: 实现 src/pages/LoginPage.vue
```

这种结构保证了 UI 设计语言在写代码之前就已经确定，不会出现"写完才发现风格不统一"的情况。

---

## 四、Phase 1：基础层迁移——一天 38 个提交

2026年6月3日，Phase 1 全部完成：38 个提交，从零开始建起完整的基础层。

### 策略一：`@ts-nocheck` 换挡法

最容易卡住 JS → TS 迁移的地方是：JavaScript 代码里充满了 `any` 类型、动态属性、原型链操作，强迫 TypeScript 编译器处理这些会产生几百个错误。

解决方案是在每个迁移文件顶部加一行：

```typescript
// @ts-nocheck
```

这一行告诉 TypeScript 编译器：**这个文件我知道有问题，先别管它**。

整个项目可以立刻通过 `vue-tsc` 检查并构建成功，同时保留了"后期逐步收紧类型"的空间。WebSocket 层（`src/websocket/`）的所有文件至今仍带着 `@ts-nocheck`——因为协议层的稳定性比类型安全更重要。

### 策略二：StoreDispatcher 解耦

旧代码里，WebSocket Handler 直接调用 Vuex：

```javascript
// 旧代码
processMessage(message) {
  vuexStore.dispatch('receiveMessage', protoMessage)
  vuexStore.dispatch('updateConversationList', conversationInfo)
}
```

这意味着：WebSocket 层与 UI 层强耦合，换掉 Vuex 就必须改所有 Handler。

解决方案是引入 `StoreDispatcher` 回调注入模式：

```typescript
// src/websocket/index.ts
export default class VueWebSocket {
  constructor(errorHandler, storeDispatcher) {
    this.storeDispatcher = storeDispatcher
  }

  sendAction(action, payload) {
    // 原来：vuexStore.dispatch(action, payload)
    // 现在：调用注入的回调，WebSocket 层零感知 Pinia
    this.storeDispatcher?.(action, payload)
  }
}
```

在 `main.ts` 里，把 Pinia Store 的方法包装成 `storeDispatcher` 函数注入。**WebSocket 层完全不知道 Pinia 的存在，Handler 代码一行不改，只换连接方式**。

### 策略三：逐层推进顺序

Phase 1 的 38 个提交严格遵循依赖关系顺序：

```
常量定义 → 数据模型 → Future/Promise → Store辅助
  → 消息类型 → WebSocket Handler → WebSocket核心
    → WebSocket单例代理 → WebRTC → Pinia Stores
      → Router → App入口
```

每一步都能在前一步的基础上运行，不会出现"依赖缺失"的情况。

### 单例代理模式：webSocketClient

`websocketcli.ts` 是整个通信层的精华——一个单例代理，所有组件和 Store 统一从这里拿 WebSocket 能力：

```typescript
class WebSocketClient {
  private _pendingFetch = new Set<string>()
  private _fetchTimer: ReturnType<typeof setTimeout> | null = null

  // 200ms 防抖批量请求，10 个用户头像变 1 个 WebSocket 请求
  _scheduleFetch(userId: string) {
    if (this._pendingFetch.has(userId) || !this._instance) return
    this._pendingFetch.add(userId)
    clearTimeout(this._fetchTimer!)
    this._fetchTimer = setTimeout(() => {
      const ids = [...this._pendingFetch]
      this._pendingFetch.clear()
      this._instance?.getUserInfos(ids)
    }, 200)
  }
}

export default new WebSocketClient()
```

消息列表渲染时可能同时需要 10 个用户的头像，防抖合并后 10 个并发请求变成 1 个。

### Phase 1 完成标准

```bash
npm run build
# vue-tsc --noEmit && vite build
# ✓ built in 3.12s
```

`vue-tsc + vite build` 零错误通过，才算 Phase 1 真正完成。

---

## 五、Phase 2：UI 层——同一天完成 12 个组件

### 组件拆分策略：Store 直连，零 prop-drilling

这个项目的策略是：**组件直接消费 Pinia Store，不层层传 props**。

```vue
<!-- src/components/conversation/ConversationList.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConversationStore } from '@/stores/useConversationStore'

// 直接拿 store，不通过 props
const { conversations, selectTarget } = storeToRefs(useConversationStore())
</script>
```

对于 IM 这类状态高度集中的应用，这个权衡是合理的：**组件与 Store 耦合增加，但组件树复杂度大幅降低**。

### CSS 变量双主题系统

主题系统在 Phase 1 就建立，核心是 `src/styles/variables.css`：

```css
/* Void Design System */
[data-theme="dark"], :root {
  --bg-void:    #07070f;
  --bg-base:    #0c0c16;
  --bg-surface: #11111e;

  --bg-bubble-in:  #1a1a2d;
  --bg-bubble-out: #4f46e5;

  --text-primary:   #eeeef8;
  --text-secondary: #8888aa;
  --accent:         #6366f1;
}

[data-theme="light"] {
  --bg-base:    #ffffff;
  --bg-surface: #f5f5f8;
  /* ... 亮色变量 */
}
```

切换主题只需要改 `document.documentElement.dataset.theme`，一行代码，全局生效。

![飞享IM主界面 — 群聊与AI回复](/img/blog/2026-06-09/1.png)

*完成后的主界面：群聊消息流畅展示，AI 内容 Markdown 渲染，代码块语法高亮*

### "先跑通，再重设计"策略

Phase 2 的初版 UI 在当天完成，功能完整但视觉风格还不够统一。然后当天晚上，一次性对 12 个文件做了"Void 设计系统"重设计（commit `f8c697e`），差异量 947 行：

```
12 files changed, 947 insertions(+), 261 deletions(-)
```

**先看到真实渲染，再做视觉判断。** 对着空白屏幕想象的 UI 和实际渲染出来的往往差很多。

![深色模式全局一致](/img/blog/2026-06-09/7.png)

*深色模式：Void 设计系统，全局 CSS 变量一致，Markdown 代码块也做了细节适配*

---

## 六、迭代优化：从能用到好用（v1.1.x → v1.2.x）

Phase 2 完成后，进入持续迭代阶段。从 v1.1.0 到 v1.2.5，共 26 个提交。

### v1.1.0：消息转发的四个技术坑

消息转发看起来简单——选消息，选联系人，发过去——但实现里有四个坑：

**坑 1：嵌套 Modal 事件拦截**  
转发对话框里嵌套了好友选择 Modal，点击好友时确认框不弹出。根因：外层 `n-modal` 的 `preset="dialog"` 拦截了内层按钮的点击事件。修复：把内层 Modal 从嵌套改为同级兄弟节点。

**坑 2：消息内容解码错误**  
转发时消息内容是 protobuf 原始对象，直接调用 `encode()` 崩溃。修复：先通过 `MessageConfig.convert2MessageContent` 解码再调用：

```typescript
const content = MessageConfig.convert2MessageContent(
  protoMessage.content,
  protoMessage.contentType
)
```

**坑 3：本地 Store 没写入**  
转发成功后消息没出现在当前会话。根因：发送成功回调里没有调用 `preAddProtoMessage` 写入本地 Store。

**坑 4：会话查找崩溃**  
转发给群组时，会话可能不在当前列表里。修复：直接构造最小会话对象，绕过查找：

```typescript
const conversation = new Conversation(0, targetId, conversationType)
```

![消息右键菜单](/img/blog/2026-06-09/5.png)

*消息右键菜单：撤回、转发、复制、删除，功能完整*

### v1.1.1：时间格式——"会说人话"

把时间从 `2026-06-04 14:35` 改成智能格式：

| 时间范围 | 显示效果 |
|----------|----------|
| 今天 | `14:35` |
| 昨天 | `昨天 14:35` |
| 本周内 | `星期三 14:35` |
| 更早 | `5月12日 14:35` |
| 跨年 | `2025年12月17日` |

复杂性不在格式化逻辑本身，而在**统一性**：消息气泡时间分隔线、会话列表最后消息时间、消息详情时间戳——三处必须用同一套策略，否则会出现会话列表显示"昨天"、进聊天窗口却显示数字时间戳的割裂感。

### v1.1.2：AI 流式回复的占位符问题

AI 回复时，需要在消息列表里显示"思考中..."占位符。问题是：新消息不断插入时，占位符会被顶到视口外，用户看不到 AI 的进度。

修复：**占位符始终放在消息列表末尾，新消息插入到它前面，首个 token 到达立刻触发滚动**：

```typescript
function preAddProtoMessage(target: string, virtualId: string) {
  const placeholder = {
    messageId: `stream_${virtualId}`,
    isStreaming: true,
  }
  chat.protoMessages.push(placeholder)
  triggerScrollBottom()  // 第一帧就锁底
}
```

### v1.1.0：可拖拽面板

会话列表与聊天区域之间加入可拖动分割线（宽度范围 200px–420px），聊天区和输入框之间也加入横向分割线（高度范围 100px–400px）。调好的尺寸持久化到 localStorage，下次打开还是你喜欢的比例。

![会话列表右键菜单](/img/blog/2026-06-09/4.png)

*会话列表：右键菜单、置顶、免打扰、未读角标，一应俱全*

### v1.2.3：群聊 @ 功能

输入 `@` 弹出成员列表，支持键盘导航、名称过滤、`@所有人`。收到 `@` 消息时，会话列表显示红色 `[有人@我]` 提示，点进去消除。

### v1.2.x 精修节奏

```
v1.2.0  WebSocket 心跳重连加日志时间戳
v1.2.1  免打扰状态显示错误、侧边栏图标对齐
v1.2.2  F5 刷新后聊天区域不自动滚动到底部
v1.2.3  群聊 @ 功能、点击头像弹出用户信息卡片
v1.2.4  会话列表时间不自动刷新（加定时触发器）
v1.2.5  头像更换和用户信息强制刷新
```

**发现一个修一个，不攒着。** 每个 bug 是独立的 commit，message 清楚描述问题和修复方式，代码库始终处于可工作状态。

---

## 七、可复用的 Vibecoding 六步工作流

把上面的经验提炼成一个通用工作流：

### 步骤 1：探索（Explore）

写代码之前，先摸清现有代码库。目的：**在开口说话之前，把事实搞清楚**。

```bash
grep -r "dispatch\(" src/ --include="*.js" | wc -l
ls src/websocket/handler/ | wc -l
```

### 步骤 2：脑暴（Brainstorm）

带着具体问题跑一次脑暴，产出物是**决策清单**，不是代码。

好的脑暴问题模板：
- "A 方案和 B 方案，各自的权衡是什么？"
- "这个技术约束下，有哪些解法？"
- "如果现在做 X，后期扩展 Y 会有什么问题？"

### 步骤 3：计划（Plan）

把决策清单转化为分阶段执行计划。关键要素：

| 要素 | 作用 |
|------|------|
| Phase 划分 | 大项目必须分阶段，每个阶段独立可验证 |
| Task 拆解 | 每个 Task 对应具体文件操作，有输入有输出 |
| 代码模板 | 关键代码骨架，AI 填格子而非从空白猜 |
| 完成标准 | 可运行的命令，可检查的结果 |

计划文档越详细，AI 执行越精准，来回修正次数越少。

### 步骤 4：执行（Execute）

按计划顺序推进，保持小提交节奏，每完成一个 Task 立刻验证。

### 步骤 5：验证（Verify）

每个阶段完成后必须跑验证命令：

```bash
npm run build   # 必须零错误
npm run dev     # 开发服务器启动，浏览器里检查基本功能
```

**不能用"看起来对"代替"运行起来对"**。

### 步骤 6：迭代（Iterate）

功能跑通后进入迭代模式：每发现一个问题立刻修，不攒债；定期做设计重审；功能迭代永远优先于代码整理。

---

## 八、踩坑与反思

### `@ts-nocheck` 是换挡，不是终点

它的代价是：这些文件里的类型错误被隐藏了，未来改动时没有类型检查的保护。

可行的路径：**每次修改某个 `@ts-nocheck` 文件时，顺带去掉注释、修复当前文件的类型错误**。慢慢积累，最终全部去掉。不要试图一次性去掉所有 `@ts-nocheck`。

### 计划里附代码模板，精准度差别巨大

有代码模板的 Task 和没有模板的 Task，AI 执行质量差别很明显。

没有模板时，AI 会"发挥创意"，可能偏离你的架构决策。有了模板，AI 就是在填格子，精准度接近 100%。

**在计划文档里多花 30 分钟写代码模板，执行阶段可以省几个小时的纠错时间。**

### CLAUDE.md 要早写，越早越好

`CLAUDE.md` 是 Claude Code 的"项目说明书"，每次对话开始时自动注入上下文。本项目在 v1.2.3 才写，但应该在项目开始时就写。

好的 CLAUDE.md 包含：
- 开发命令（`npm run dev`, `npm run build`...）
- 架构总览（关键目录和职责）
- 关键约定（别名、类型声明位置、特殊设计决策）
- 语言要求（本项目要求所有回复使用中文）

有了 CLAUDE.md，每次开启新对话不需要重新介绍项目背景，AI 直接进入工作状态。

### 群组音视频通话的两个隐蔽 bug

这两个 bug 值得单独记录，因为它们都是"看代码看不出来，只有运行才能发现"的那种：

- **`tos` 字段丢失**：群组视频邀请消息在消息转换时悄悄丢失了 `tos` 字段，导致被邀请成员收不到邀请。原因是序列化时漏了这个字段的映射。
- **`window.name` 污染**：ICE 候选的 `name` 字段错误引用了全局 `window.name`，而不是发送者 ID。这是一个 JavaScript 命名遮蔽问题，在静态分析里完全看不出来。

![音频通话界面](/img/blog/2026-06-09/8.png)

*音频通话：绿色拨号界面，等待接听状态清晰*

![视频通话界面](/img/blog/2026-06-09/9.png)

*视频通话进行中：大屏显示对方画面，右下角小窗显示自己，支持拖拽移动*

---

## 九、技术成果速览

经过 7 天 64 次提交，最终交付的功能：

| 功能模块 | 实现内容 |
|----------|----------|
| **消息类型** | 文本、图片、语音、视频、文件、名片、位置、GIF 动图 |
| **AI 集成** | 流式回复、占位符动画、Markdown 渲染、代码块高亮 |
| **通话** | 1v1 音频/视频通话、群组视频通话、画中画预览、可拖拽 |
| **群聊** | 创建群聊、添加/移除成员、群公告、群侧栏、@ 提及 |
| **消息操作** | 转发、撤回、复制、删除、右键菜单 |
| **会话管理** | 置顶、免打扰、删除、可拖拽调整宽高 |
| **主题** | 亮色/深色双主题，CSS 变量系统，一键切换 |
| **时间显示** | 智能格式（今天/昨天/星期几/月日/年月日） |

技术栈：

- **Vue 3.4** + `<script setup>` Composition API
- **TypeScript 5** + `vue-tsc` 构建时类型检查
- **Vite 5** 构建工具（开发热重载 < 100ms）
- **Pinia 2** 状态管理（7 个 Store，Composition API 风格）
- **Naive UI 2** 组件库 + 完整 CSS 变量主题系统
- **自定义 WebSocket 协议层**（保留原有业务逻辑，替换 Vuex 依赖）

---

## 十、结语：设计权在人，执行权在 AI

回顾整个 7 天 64 提交的历程：

**AI 做了什么**：按照计划把代码模板填充成完整文件；跨文件重构；根据 brief 生成 UI 组件初版；定位 bug 的可能原因；写 commit message。

**人做了什么**：分析旧项目架构，识别迁移风险；制定分阶段计划，确定执行顺序；选择技术方案；判断每个阶段的完成质量；识别用户体验问题，决定修复优先级。

Vibecoding 不是把所有决策都交给 AI，而是**把决策权留在人手里，把执行权交给 AI**。

7天64提交不是蛮力堆出来的，是清晰计划 + 合理分工的结果。

这套方法论的适用范围不只是 IM 项目，任何有明确架构决策、可以分阶段推进的重构任务，都可以用同样的方式来做。

---

**演示地址**：[https://web3.fsharechat.cn/conversation](https://web3.fsharechat.cn/conversation)（邮箱 + 验证码即可登录，无需注册）

**源码**：[github.com/fsharechat/vue-chat-pro-claude](https://github.com/fsharechat/vue-chat-pro-claude)
