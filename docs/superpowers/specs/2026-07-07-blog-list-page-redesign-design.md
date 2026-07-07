# 博客列表页样式优化 —— 设计文档

## 背景与目标

博客列表页（`/blog`）当前直接使用 Docusaurus 内置的 `BlogPostItem` 组件渲染每一条列表项，标题字号高达 `3rem`，导致列表页视觉上标题占比过大、信息密度低，与站点其他页面的精致感不匹配。目标是把列表页改造成类似掘金列表的紧凑样式：小号加粗标题、一行 meta 信息（头像/作者/日期/阅读时长/标签）、2 行摘要裁剪，以及可选的右侧缩略图。

文章详情页（单篇博客正文页）的展示效果不在本次范围内，维持现状。

## 现状调查（关键发现）

- 标题超大是 `node_modules/@docusaurus/theme-classic/lib/theme/BlogPostItem/styles.module.css` 中 `.blogPostTitle { font-size: 3rem; }` 造成的，该样式同时作用于列表页（`<h2>`）和详情页（`<h1>`），仓库里尚未对 `BlogPostItem` 做过 swizzle 覆盖。
- `BlogPostItem` 被三处复用：`BlogListPage`、`BlogPostPage`（传入 `isBlogPostPage`）、`BlogTagsPostsPage`。只有 `BlogPostPage` 传 `isBlogPostPage=true`，因此可以用这个 prop 干净地区分"列表态"和"详情态"两种渲染。
- 全站 16 篇博客中，只有 4 篇旧文章（`2017-12-31-tech-overview.md`、`2019-12-19-996.md`、`2020-11-13-vray.md`、`2020-12-31-year-summary.md`）正文里有配图；其余 12 篇 2026 年新写的技术长文完全没有任何图片。
- 全站只有 2 篇文章（`tech-overview`、`996`）的 frontmatter 写了 `description` 字段，其余 14 篇没有。所有文章 `<!--truncate-->` 之前的内容都是单个自然段（无多段落、无列表），适合直接做 2 行 CSS 裁剪。

## 方案

### 技术路线：swizzle `BlogPostItem`

将 `@docusaurus/theme-classic` 的 `BlogPostItem` 复制为项目内组件 `src/theme/BlogPostItem/index.tsx`（+ `styles.module.css`），遵循仓库里 `src/theme/*` 均为 `.tsx` 的约定。在组件内部按 `isBlogPostPage` 分叉：

- `isBlogPostPage === true`（文章详情页）：渲染逻辑与现状保持一致，不改动视觉。
- `isBlogPostPage === false`（列表页 / 标签筛选页）：使用新的紧凑卡片布局。

选择 swizzle 而非纯 CSS 覆盖，是因为新布局需要新增缩略图区域、调整信息行的 DOM 结构和顺序，仅靠 CSS 无法插入新元素。

### 列表项布局

```
┌──────────────────────────────────────────┬────────────┐
│ 标题（加粗，约22px，最多2行，超出省略号）        │            │
│ 🅐 作者 · 日期 · N分钟阅读        [标签][标签] │  缩略图     │
│ 摘要文字，最多2行，超出省略号                    │  120×80    │
└──────────────────────────────────────────┴────────────┘
```

- **标题**：新增 `blogListItemTitle` 样式类（区别于详情页沿用的 `blogPostTitle`），字号约 `1.375rem`（22px）、加粗，`-webkit-line-clamp: 2` 限制最多两行，超出显示省略号，整体可点击跳转到文章详情。
- **meta 行**：左侧小头像（约 28px）+ 作者名 + 日期 + 阅读时长，一行展示，小号浅色文字；右侧最多展示 4 个标签（`tags.slice(0, 4)`），标签样式为小胶囊，颜色沿用现有配色。头像/作者信息缺失时该项直接不渲染（兼容没写 `author` 的文章）。
- **摘要**：直接使用 `metadata.description` 字段——该字段由 Docusaurus 在构建期生成，值为 `frontMatter.description || excerpt`（`excerpt` 是官方 `createExcerpt()` 从正文自动提取的纯文本，已剥离标题/加粗/图片/HTML 标签等 Markdown 标记），无需自己实现"优先 description、回退正文"的逻辑。渲染为普通 `<p>`，外层加 `-webkit-line-clamp: 2` 做两行裁剪。
- **缩略图**：仅当 `frontMatter.image` 存在时渲染右侧缩略图列（固定尺寸约 120×80，`object-fit: cover`，圆角）；不存在时文本列自动占满整行，不留空白占位。视口宽度小于约 640px 时隐藏缩略图列，保证移动端为单栏纯文字布局。
- **列表项间距**：用一条细分割线（`border-bottom: 1px solid var(--palette-white-10)`）替代现有的 `margin-bottom--xl`，让列表整体更紧凑，接近参考样式的列表观感。

### frontmatter 改动

仅给以下 4 篇文章的 frontmatter 补充 `image` 字段，直接复用文中已有的图片地址，不新增/生成任何图片资源：

| 文章 | image 取值 |
|---|---|
| `2017-12-31-tech-overview.md` | `https://media.fsharechat.cn/minio-bucket-file-name/it.jpeg` |
| `2019-12-19-996.md` | `https://media.fsharechat.cn/minio-bucket-file-name/fendou.jpg` |
| `2020-11-13-vray.md` | `https://media.fsharechat.cn/minio-bucket-image-name/best-vpn-for-china-cn-2020.jpg` |
| `2020-12-31-year-summary.md` | `https://media.fsharechat.cn/minio-bucket-image-name/2020-zongjie.gif` |

其余 12 篇文章不做任何 frontmatter 改动，列表中对应项不显示缩略图。

### 样式取色

新样式复用 `src/css/global.css` 中已有的调色板变量（如 `--palette-gray`、`--palette-white-10`、`--palette-white-30`、`--font-size-*` 等）与 `--ifm-color-primary` 系列，不引入新的颜色变量，与 `Button`、`Layout` 等既有主题覆写保持视觉一致性。纯深色模式（站点唯一模式）下需要过一遍对比度，确保浅色 meta 文字在深色背景上依然可读。

## 影响范围

- 改动文件：新增 `src/theme/BlogPostItem/index.tsx`、`src/theme/BlogPostItem/styles.module.css`；修改上述 4 篇文章的 frontmatter。
- 不改动：`BlogListPage`、`BlogPostPaginator`、文章详情页视觉、`sidebars.js`、构建/部署流程。
- 影响页面：`/blog`（列表）、`/blog/tags/*`（标签筛选列表）。详情页 `/blog/<slug>` 不受影响。

## 已知限制

- `metadata.description` 在没有 frontmatter `description` 时由 `createExcerpt()` 自动截取正文若干行拼接成一段纯文本，长度不完全可控（例如比较短的段落可能不够两行、较长的段落会被 `-webkit-line-clamp: 2` 裁到刚好两行），属于 Docusaurus 内置行为，不在本次改动范围内单独处理。
- 12 篇无图文章的列表项固定为纯文字宽版布局，与 4 篇有图文章的双栏布局并存，列表视觉上不完全统一（本次范围内是预期结果，用户已确认）。

## 验收标准

- `/blog` 列表页每条目：标题不超过 2 行、字号明显小于当前 3rem、摘要不超过 2 行、meta 信息紧凑展示在一行。
- 有 `image` 字段的 4 篇文章在列表中展示右侧缩略图；其余 12 篇不显示缩略图且不留空白。
- `/blog/tags/*` 标签筛选页表现与 `/blog` 一致。
- 文章详情页 `/blog/<slug>` 视觉与改动前一致（标题大小、头像信息、内容、标签、Read More 均不变）。
- 移动端（<640px）缩略图隐藏，文字区域占满整行，不出现布局错乱。
- `yarn build` 通过（含 fork-ts-checker 的类型检查）。
