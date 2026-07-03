# 飞享IM 功能演示短视频 —— 设计文档

## 背景与目标

飞享IM（FshareIM）需要一支功能演示说明视频，用于朋友圈/微信视频号等短视频渠道传播。目标受众是潜在的私有部署用户/合作方，核心诉求是快速、直观地展示产品覆盖的功能面（登录、用户信息、好友、单聊、群聊、实时音视频）以及四端（web/h5/android/pc客户端）的能力差异。

本仓库（fsharechat.io）是纯文档/官网站点，不包含任何真实 App 截图或录屏素材 —— `docs/introduction.md` 中引用的产品截图均为外链图片（`media.fsharechat.cn`），源文件不在仓库内，也没有可用于真机录屏剪辑的素材或环境。因此确定采用**代码驱动的动效解说视频**方案，而非真机录屏剪辑。

功能矩阵数据来源为 `docs/introduction.md` 中的「功能列表」表格（web/h5/android/pc客户端 四端对比），与用户在对话中提供的内容一致。

## 范围（精简版）

- 时长目标：约 90 秒（8 大分类，每类挑 1-2 个代表功能，非逐条展示全部 25 个功能点）
- 画幅：9:16 竖屏，1080×1920，30fps —— 面向朋友圈/视频号等移动端短视频场景
- 讲解形式：AI 配音旁白（edge-tts，`zh-CN-YunxiNeural`）+ 逐句字幕，配背景音乐
- 视觉风格：深色主题，主色沿用站点 `--ifm-color-primary`（品牌粉 `#c93261` 系）

明确不做（超出本次范围，留待后续扩展）：
- 不做完整版（全部 25 个功能点逐条展示的 3-5 分钟版本）—— 但组件设计需保证后续可以直接加场景扩展成完整版，不需要推倒重来
- 不做真机录屏素材接入
- 不接入站点主构建/部署流程

## 技术方案

### 项目隔离

Remotion 要求 React 18+，而本仓库主站基于 Docusaurus 2 alpha，锁定 React 16.13.1，两者版本冲突无法共用依赖树。因此视频项目作为完全独立的子目录 `video/`，拥有独立的 `package.json` 和 `node_modules`，**不接入**根目录 yarn workspace，**不参与** `yarn build`/GitHub Actions 部署流程。产物（mp4）是一次性构建产出，人工上传/发布到短视频渠道，不需要和网站构建打通。

### 配音方案

使用 edge-tts（微软 Edge 内置 TTS 的免费接口，通过 Node 封装库如 `msedge-tts` 调用），零成本、无需注册账号或申请 API key，中文音色质量满足演示视频需求。默认音色 `zh-CN-YunxiNeural`（活泼男声，适合科技产品快节奏解说）。

风险：edge-tts 为非官方接口，长期稳定性无保证，但本次是一次性视频产出，可接受。若未来该接口不可用，可替换为阿里云/腾讯云 TTS（飞享IM 本身已集成这两家的验证码服务，账号体系上无额外接入成本）。

### 目录结构

```
video/
  package.json          # 独立依赖：remotion, msedge-tts 等，React 18
  src/
    Root.tsx             # 注册 Composition（9:16, 90s@30fps）
    scenes/
      Intro.tsx
      Login.tsx
      ProfileFriends.tsx
      SingleChat.tsx
      GroupChat.tsx
      RealtimeAV.tsx
      PlatformMatrix.tsx  # 复用 features.ts 中的功能矩阵数据
      Outro.tsx
    components/           # 可复用：PhoneFrame 手机壳、ChatBubble、CheckMatrix、SubtitleBar
    data/
      features.ts          # 从 docs/introduction.md 功能矩阵抽出的结构化数据（分类/功能点/四端支持）
      script.ts             # 每段旁白文案 + 时长
    audio/                 # edge-tts 生成的 mp3（按场景切分，gitignore，构建产物）
  scripts/
    gen-voiceover.mjs      # 调 msedge-tts，按 script.ts 批量生成音频并读出真实时长，回写到 timeline
```

### 数据流

1. `data/script.ts` 定义每段旁白文案
2. `scripts/gen-voiceover.mjs` 调用 edge-tts，为每段文案生成 mp3，并读取真实音频时长
3. 真实时长回写到各场景 `<Sequence>` 的 `durationInFrames`，保证字幕、动画节奏与配音严格对齐（不手动猜时长对轴）
4. `data/features.ts` 中的结构化功能矩阵数据同时驱动 `PlatformMatrix.tsx` 场景的表格动画，避免手工重画格子导致与源表格数据不一致

## 场景与内容结构

| # | 场景 | 时长 | 内容 |
|---|------|------|------|
| 1 | 片头 Intro | 5s | 飞享IM Logo + 标题「飞享IM · 功能演示」 |
| 2 | 登录 Login | 10s | 手机号 + 验证码登录动画，标注「支持腾讯云/阿里云验证码」 |
| 3 | 用户信息+好友 ProfileFriends | 13s | 头像/昵称编辑卡片 → 好友请求发送/通过动画 |
| 4 | 单聊 SingleChat | 17s | 文本/图片/语音气泡飞入 → 撤回/转发操作演示 |
| 5 | 群聊 GroupChat | 13s | 建群 → 拉人 → 群成员列表 |
| 6 | 实时音视频 RealtimeAV | 15s | 一对一通话界面 → 转场到群组多人通话（核心卖点，权重最高） |
| 7 | 多端能力对比 PlatformMatrix | 12s | 动画呈现 web/h5/android/pc 四端勾选矩阵，突出「PC/Android 功能最全」 |
| 8 | 片尾 Outro | 5s | 官网地址 + 二维码 CTA |

合计约 90 秒。

## 边界情况

- edge-tts 请求失败/超时：脚本直接报错退出，不做静默兜底（空音频/跳过），因为是一次性视频产出，宁可失败后人工重试
- 字幕超屏：字幕组件按字数自动换行；文案撰写阶段控制在每行 ≤14 字，超过两行需要改写更短的句子而非依赖组件截断
- 多端矩阵场景的数据必须直接从 `features.ts` 结构化数据渲染，不允许在组件里手写重复的表格内容，避免和源表格（`docs/introduction.md`）产生不一致

## 验证方式（视频项目没有单元测试，用预览走查代替）

1. `remotion preview` 本地逐场景走查节奏、转场、字幕与配音是否对齐
2. `remotion render` 输出一版 mp4，人工过一遍检查：配音字幕同步、转场是否生硬、多端矩阵数字是否与 `docs/introduction.md` 一致
3. 最终 mp4 在手机上按朋友圈/视频号实际播放场景走查竖屏可读性（文字大小、关键信息是否在安全区内）

## 待用户确认/后续可调项

- 配音音色（当前默认 `zh-CN-YunxiNeural`，用户未明确确认，可随时切换为 `zh-CN-XiaoxiaoNeural` 等其他音色）
- 背景音乐素材：需要用户提供一首免版权 BGM，或使用占位音效库素材
