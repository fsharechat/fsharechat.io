# 博客列表页样式优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/blog` 列表页和 `/blog/tags/*` 标签列表页的文章条目从"标题超大、信息稀疏"的默认 Docusaurus 样式，改造成紧凑的列表卡片样式（小标题、单行 meta、2 行摘要裁剪、可选缩略图），文章详情页视觉保持不变。

**Architecture:** swizzle（复制并改写）Docusaurus 内置的 `BlogPostItem` 组件到 `src/theme/BlogPostItem/`，按已有的 `isBlogPostPage` prop 分叉渲染：`true` 时完全复用原有详情页渲染逻辑（零视觉变化），`false` 时使用新的紧凑列表布局。摘要文字直接复用 Docusaurus 内置的 `metadata.description`（`frontMatter.description || 自动摘要`），不需要额外的摘要提取逻辑。同时给 4 篇正文里已有配图的旧文章补充 `image` frontmatter 字段，使其在列表中展示缩略图。

**Tech Stack:** Docusaurus 2.0.0-alpha.64（`@docusaurus/theme-classic` 提供的 `BlogPostItem`/`BlogListPage`/`BlogTagsPostsPage` 复用同一个 `@theme/BlogPostItem` 别名）、React 16.13.1 + TypeScript 4.0.2（strict 模式）、CSS Modules、`clsx`。

## Global Constraints

- 所有新页面/组件文件使用 `.tsx` 扩展名（CLAUDE.md 项目约定）。
- 样式使用 CSS Modules，条件类名用 `clsx`，不写内联样式（CLAUDE.md 项目约定）。
- `tsconfig.json` 开启 `strict: true`（含 `strictNullChecks`），但 `noImplicitAny: false`；组件 props 需要显式类型定义。
- 本仓库没有配置任何自动化测试框架（`package.json` 中无 jest/testing-library），验证手段为：`tsc` 类型检查 + `yarn build` 生产构建 + 本地 `yarn start` 手动浏览器验证（CLAUDE.md：前端改动必须在浏览器里跑一遍再算完成）。
- 不改动 `BlogListPage`、`BlogPostPaginator`、构建/部署流程（`scripts/pre-build.js`、GitHub Actions）。
- 文章详情页（`isBlogPostPage=true`）视觉必须与改动前完全一致：标题字号、日期行、头像信息块、正文、Tags/Read More footer 均不能变。

---

## Task 1: 给 4 篇旧文章补充 `image` frontmatter

**Files:**
- Modify: `blog/2017-12-31-tech-overview.md`
- Modify: `blog/2019-12-19-996.md`
- Modify: `blog/2020-11-13-vray.md`
- Modify: `blog/2020-12-31-year-summary.md`

**Interfaces:**
- Produces: 这 4 篇文章的 frontmatter 新增 `image: <url>` 字段，供 Task 2 的 `BlogPostItem` 通过 `frontMatter.image` 读取并在列表页渲染缩略图。

- [ ] **Step 1: 给 `blog/2017-12-31-tech-overview.md` 加 `image` 字段**

当前文件开头：
```markdown
---
title: "IT软件知识-技能图谱"
description: Linux 基础技能
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
---
```

改为（在 `author_image_url` 后新增一行 `image` 字段，值取自该文章正文里已有的 `<img src="...">`）：
```markdown
---
title: "IT软件知识-技能图谱"
description: Linux 基础技能
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
image: https://media.fsharechat.cn/minio-bucket-file-name/it.jpeg
---
```

- [ ] **Step 2: 给 `blog/2019-12-19-996.md` 加 `image` 字段**

当前文件开头：
```markdown
---
title: 996的思考
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [996, 奋斗]
description:
  996奋斗的由来
---
```

改为：
```markdown
---
title: 996的思考
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [996, 奋斗]
description:
  996奋斗的由来
image: https://media.fsharechat.cn/minio-bucket-file-name/fendou.jpg
---
```

- [ ] **Step 3: 给 `blog/2020-11-13-vray.md` 加 `image` 字段**

当前文件开头：
```markdown
---
title: 使用vray进行网络链接代理进行网站访问
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [996, 奋斗]
---
```

改为：
```markdown
---
title: 使用vray进行网络链接代理进行网站访问
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [996, 奋斗]
image: https://media.fsharechat.cn/minio-bucket-image-name/best-vpn-for-china-cn-2020.jpg
---
```

- [ ] **Step 4: 给 `blog/2020-12-31-year-summary.md` 加 `image` 字段**

当前文件开头：
```markdown
---
title: 2020技术总结与飞享IM项目规划发展
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [996, 奋斗]
---
```

改为：
```markdown
---
title: 2020技术总结与飞享IM项目规划发展
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [996, 奋斗]
image: https://media.fsharechat.cn/minio-bucket-image-name/2020-zongjie.gif
---
```

- [ ] **Step 5: 核对 4 个文件都改对了**

Run: `grep -n "^image:" blog/2017-12-31-tech-overview.md blog/2019-12-19-996.md blog/2020-11-13-vray.md blog/2020-12-31-year-summary.md`

Expected: 4 行输出，每个文件各一行 `image: https://...`，地址与上面 Step 1-4 一一对应。

- [ ] **Step 6: Commit**

```bash
git add blog/2017-12-31-tech-overview.md blog/2019-12-19-996.md blog/2020-11-13-vray.md blog/2020-12-31-year-summary.md
git commit -m "blog: 为4篇旧文章补充 image frontmatter 用于列表缩略图"
```

---

## Task 2: swizzle `BlogPostItem`，实现列表页紧凑布局

**Files:**
- Create: `src/theme/BlogPostItem/styles.module.css`
- Create: `src/theme/BlogPostItem/index.tsx`
- Test: 无自动化测试（本仓库无测试框架），用 `tsc --noEmit`、`yarn build`、`yarn start` 手动浏览器验证代替。

**Interfaces:**
- Consumes: Task 1 产出的 4 篇文章的 `frontMatter.image` 字段；Docusaurus 运行时通过 `@theme/BlogPostItem` 别名自动优先加载 `src/theme/BlogPostItem/index.tsx`（无需额外注册）。
- Produces: 默认导出的 React 组件 `BlogPostItem(props: Props)`，`Props` 包含 `children: React.ReactNode`、`frontMatter: FrontMatter`、`metadata: Metadata`、`truncated?: boolean`、`isBlogPostPage?: boolean`；被 `BlogListPage`、`BlogPostPage`、`BlogTagsPostsPage`（均来自 `@docusaurus/theme-classic`，本次不改动）按原有方式调用。

- [ ] **Step 1: 创建 `src/theme/BlogPostItem/styles.module.css`**

```css
.blogPostTitle {
  font-size: 3rem;
}

.blogPostDate {
  font-size: 0.9rem;
}

.listItem {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--palette-white-10);
}

.listItem:first-child {
  padding-top: 0;
}

.listItemMain {
  flex: 1;
  min-width: 0;
}

.listItemTitle {
  margin: 0 0 0.5rem;
  font-size: 1.375rem;
  font-weight: var(--ifm-font-weight-bold);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.listItemTitle a {
  color: var(--palette-white);
}

.listItemTitle a:hover {
  color: var(--ifm-color-primary);
  text-decoration: none;
}

.listItemMeta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: var(--font-size-small);
  color: var(--palette-pale-blue);
}

.listItemAvatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.listItemTags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-left: auto;
}

.listItemTag {
  padding: 0.125rem 0.625rem;
  border-radius: 1rem;
  background-color: var(--palette-white-10);
  color: var(--palette-pale-blue);
  font-size: calc(var(--font-size-small) - 1px);
}

.listItemTag:hover {
  background-color: var(--palette-white-20);
  color: var(--palette-white);
  text-decoration: none;
}

.listItemSummary {
  margin: 0;
  font-size: var(--font-size-normal);
  color: var(--palette-pale-blue);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.listItemThumbnailLink {
  flex-shrink: 0;
}

.listItemThumbnail {
  display: block;
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--ifm-global-border-radius);
}

@media (max-width: 640px) {
  .listItemThumbnailLink {
    display: none;
  }
}
```

- [ ] **Step 2: 创建 `src/theme/BlogPostItem/index.tsx`**

```tsx
import React from "react"
import clsx from "clsx"
import { MDXProvider } from "@mdx-js/react"
import Head from "@docusaurus/Head"
import Link from "@docusaurus/Link"
import MDXComponents from "@theme/MDXComponents"
import useBaseUrl from "@docusaurus/useBaseUrl"

import styles from "./styles.module.css"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

type Tag = {
  label: string
  permalink: string
}

type FrontMatter = {
  title: string
  author?: string
  author_title?: string
  authorTitle?: string
  author_url?: string
  authorURL?: string
  author_image_url?: string
  authorImageURL?: string
  image?: string
  keywords?: string[]
}

type Metadata = {
  date: string
  permalink: string
  tags: Tag[]
  readingTime?: number
  description?: string
}

type Props = {
  children: React.ReactNode
  frontMatter: FrontMatter
  metadata: Metadata
  truncated?: boolean
  isBlogPostPage?: boolean
}

const formatDate = (date: string) => {
  const match = date.substring(0, 10).split("-")
  const year = match[0]
  const month = MONTHS[parseInt(match[1], 10) - 1]
  const day = parseInt(match[2], 10)
  return { year, month, day }
}

const BlogPostItem = (props: Props) => {
  const { children, frontMatter, metadata, truncated, isBlogPostPage = false } = props
  const { date, permalink, tags, readingTime, description } = metadata
  const { author, title, image, keywords } = frontMatter
  const authorURL = frontMatter.author_url || frontMatter.authorURL
  const authorTitle = frontMatter.author_title || frontMatter.authorTitle
  const authorImageURL = frontMatter.author_image_url || frontMatter.authorImageURL
  const imageUrl = useBaseUrl(image, { absolute: true })

  const head = (
    <Head>
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(",")} />}
      {image && <meta property="og:image" content={imageUrl} />}
      {image && <meta property="twitter:image" content={imageUrl} />}
      {image && <meta name="twitter:image:alt" content={`Image for ${title}`} />}
    </Head>
  )

  if (isBlogPostPage) {
    const { year, month, day } = formatDate(date)
    return (
      <>
        {head}
        <article>
          <header>
            <h1 className={clsx("margin-bottom--sm", styles.blogPostTitle)}>{title}</h1>
            <div className="margin-vert--md">
              <time dateTime={date} className={styles.blogPostDate}>
                {month} {day}, {year}
                {readingTime && <> · {Math.ceil(readingTime)} min read</>}
              </time>
            </div>
            <div className="avatar margin-vert--md">
              {authorImageURL && (
                <a
                  className="avatar__photo-link avatar__photo"
                  href={authorURL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img src={authorImageURL} alt={author} />
                </a>
              )}
              <div className="avatar__intro">
                {author && (
                  <>
                    <h4 className="avatar__name">
                      <a href={authorURL} target="_blank" rel="noreferrer noopener">
                        {author}
                      </a>
                    </h4>
                    <small className="avatar__subtitle">{authorTitle}</small>
                  </>
                )}
              </div>
            </div>
          </header>
          <section className="markdown">
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>
          </section>
          {(tags.length > 0 || truncated) && (
            <footer className="row margin-vert--lg">
              {tags.length > 0 && (
                <div className="col">
                  <strong>Tags:</strong>
                  {tags.map(({ label, permalink: tagPermalink }) => (
                    <Link key={tagPermalink} className="margin-horiz--sm" to={tagPermalink}>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
              {truncated && (
                <div className="col text--right">
                  <Link to={metadata.permalink} aria-label={`Read more about ${title}`}>
                    <strong>Read More</strong>
                  </Link>
                </div>
              )}
            </footer>
          )}
        </article>
      </>
    )
  }

  const { year, month, day } = formatDate(date)
  const visibleTags = tags.slice(0, 4)

  return (
    <>
      {head}
      <article className={styles.listItem}>
        <div className={styles.listItemMain}>
          <h2 className={styles.listItemTitle}>
            <Link to={permalink}>{title}</Link>
          </h2>
          <div className={styles.listItemMeta}>
            {authorImageURL && <img className={styles.listItemAvatar} src={authorImageURL} alt={author} />}
            {author && <span>{author}</span>}
            <span>
              {month} {day}, {year}
            </span>
            {readingTime && <span>{Math.ceil(readingTime)} min read</span>}
            {visibleTags.length > 0 && (
              <span className={styles.listItemTags}>
                {visibleTags.map(({ label, permalink: tagPermalink }) => (
                  <Link key={tagPermalink} className={styles.listItemTag} to={tagPermalink}>
                    {label}
                  </Link>
                ))}
              </span>
            )}
          </div>
          {description && <p className={styles.listItemSummary}>{description}</p>}
        </div>
        {image && (
          <Link to={permalink} className={styles.listItemThumbnailLink}>
            <img className={styles.listItemThumbnail} src={imageUrl} alt={title} />
          </Link>
        )}
      </article>
    </>
  )
}

export default BlogPostItem
```

- [ ] **Step 3: 类型检查**

Run: `npx tsc --noEmit`

Expected: 无报错退出（exit code 0）。如果报 `@mdx-js/react`、`@docusaurus/Head` 等模块找不到类型，检查是否遗漏了原组件里的某个 import——不要新增依赖，这些模块的类型声明已经在 `node_modules/@docusaurus/module-type-aliases` 里全局声明过，同目录其它 `src/theme/*` 文件已经在用。

- [ ] **Step 4: 生产构建**

Run: `yarn build`

Expected: 构建成功退出（exit code 0），输出中出现 `Client success` / 生成 `build/blog/index.html` 等页面，没有 `BlogPostItem` 相关的 webpack/TS 报错。

- [ ] **Step 5: 本地浏览器验证**

Run: `yarn start`（默认监听 `http://localhost:3000`）

打开浏览器手动检查以下几点，逐条确认：
1. `/blog` 列表页：每条目标题不超过 2 行、明显小于原来的超大标题；标题下方一行展示"头像 + 作者 + 日期 + 阅读时长"，标签靠右显示（最多 4 个）；摘要不超过 2 行。
2. `/blog` 列表页中 2026-07-06、2020-12-31、2019-12-19、2020-11-13、2017-12-31 这几篇（对应 Task 1 加了 `image` 的 4 篇 + 补充确认其余无图文章）——4 篇旧文章右侧应显示缩略图，其余文章不显示缩略图也不留空白。
3. 任意打开一篇文章详情页（如 `/blog/2026/07/06/fshareim-product-showcase` 或站点实际生成的 slug），确认标题大小、头像信息块、正文、Tags、Read More 与改动前一致（可以用 `git stash` 临时还原对比，或凭记忆核对无明显变化）。
4. `/blog/tags/`（标签总览）下任选一个标签进入 `/blog/tags/<tag>`，确认该列表页也是紧凑布局。
5. 把浏览器窗口缩到 640px 以下宽度，确认缩略图列隐藏、文字区域占满整行，没有布局错乱或横向滚动条。

确认以上 5 点都符合预期后，`Ctrl+C` 停掉 `yarn start`。

- [ ] **Step 6: Commit**

```bash
git add src/theme/BlogPostItem/index.tsx src/theme/BlogPostItem/styles.module.css
git commit -m "feat: 重构博客列表页样式为紧凑卡片布局

swizzle BlogPostItem，按 isBlogPostPage 区分列表态/详情态渲染：
列表态改为小标题+单行meta+2行摘要裁剪+可选缩略图，详情页视觉不变。"
```
