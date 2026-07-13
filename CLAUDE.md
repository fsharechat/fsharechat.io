# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

这是**飞享IM (FshareIM)** 的文档与官网站点 —— 基于 Docusaurus 2 构建的静态网站，服务于一款可私有部署的即时通讯系统。技术栈为 React + TypeScript，内容以 Markdown 形式存放。

## 常用命令

```bash
yarn start        # 启动本地开发服务器（支持热重载）
yarn build        # 生产构建（内部会设置 PWA_SW_CUSTOM=）
yarn pre-build    # 通过 imagemin 优化 static/ 目录下的图片（构建前自动执行）
yarn serve        # 在本地预览生产构建产物
yarn deploy       # 部署到 GitHub Pages
```

**代码检查自动运行**：通过 Husky pre-commit 钩子（lint-staged 校验图片文件大小），以及 `yarn build` 时由 fork-ts-checker-webpack-plugin 触发。

### 本地启动注意事项

本仓库依赖 Docusaurus 2.0.0-alpha.64（内置 webpack 4），在 Node 17+（含本机常用的 Node 20/22）直接执行 `yarn start` 会报错：

```
Error: error:0308010C:digital envelope routines::unsupported
```

需加上 `--openssl-legacy-provider` 后再启动：

```bash
NODE_OPTIONS=--openssl-legacy-provider yarn start
```

其他排查点：

- **端口 3000 被占用**：`lsof -nP -iTCP:3000 -sTCP:LISTEN` 查看占用进程；若是启动多日、访问返回 503 的僵尸进程，`kill <PID>` 后重新执行上面的启动命令。
- **curl/浏览器访问 localhost 返回 503 但进程正常**：若本机设置了 `http_proxy`/`https_proxy` 环境变量，可能会把 localhost 请求也转发到代理导致 503。用 `curl --noproxy localhost ...` 验证；浏览器需将 `localhost`/`127.0.0.1` 加入代理例外。

## 架构说明

### 内容 vs. 代码

- **`docs/`** — Markdown 文档，分为：`concept/`（系统架构）、`prepare/`（MySQL/MinIO/Nginx/Coturn 环境准备）、`guide/`（CentOS/Ubuntu/Windows/集群安装）、`api/`、`consult/`
- **`blog/`** — 博客文章
- **`src/pages/`** — React TSX 页面（`index.tsx` 首页、`getstarted.tsx`、`client/`）
- **`src/theme/`** — Docusaurus 主题覆写：`Layout/`、`Navbar/`、`Footer/`、`Button/`、`Image/`、`DocPage/`、`MDXPage/`、`hooks/`
- **`src/css/`** — CSS Modules（`global.css` + 各组件的 `*.module.css`）

### 关键配置文件

- **`docusaurus.config.js`** — 站点元数据、插件（ideal-image、PWA、sitemap、GA `G-H6YPVFKWXP`、Algolia 搜索）、纯深色模式主题、导航栏/页脚链接，以及一个自定义 remark 插件（将 Markdown 中的 `{@variableName@}` 模板变量替换为实际值）
- **`sidebars.js`** — 文档导航层级（6 个顶级分类）

### 构建与部署流程

1. `scripts/pre-build.js` 在 Docusaurus 运行前优化图片（gifsicle/svgo）
2. Docusaurus 将 React 页面 + Markdown 编译为 `build/` 目录（静态 HTML/CSS/JS）
3. GitHub Actions（`.github/workflows/build_deploy_server.yml`）在每次推送到 `master` 时触发：使用 Node 14 构建，通过 SCP 将 `build/` 上传至服务器 `/data/github/fsharechat.cn`，最后重载 Nginx

Nginx 需以 `try_files $uri $uri/ /index.html =404` 方式服务 `build/` 目录。

### 侧边栏（仅开发模式）

`docs/__guidelines/` 仅在 `NODE_ENV !== 'production'` 时显示在侧边栏，包含站点文档的写作规范，可供参考。

### 主题与样式规范

- `src/theme/` 中的组件用于覆写或扩展 Docusaurus 内置组件，导入时使用 `@theme/*` 路径别名
- 样式使用 CSS Modules —— `Component.module.css` 与组件文件放在同一目录
- 条件类名使用 `clsx`，不使用内联样式
- 纯深色模式（config 中 `defaultMode: 'dark'`，`disableSwitch: true`）

### TypeScript

已启用严格模式（`tsconfig.json`）。路径别名 `@theme/*` 指向 `src/theme/`。所有新页面和组件应使用 `.tsx` 扩展名。
