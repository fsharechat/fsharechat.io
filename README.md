
# fshare.io

[This website](https://fsharechat.cn/) is built using
[Docusaurus 2](https://v2.docusaurus.io/). Pages & components are written in
TypeScript, the styles in vanilla CSS with variables using
[CSS Modules](https://github.com/css-modules/css-modules).

## Installation

```script
yarn
```

## Local development

```script
yarn start
```

This command starts a local development server and open up a browser window.
Most changes are reflected live without having to restart the server.

## Build for production

```script
yarn build
```

This command generates static content into the `build` directory and can be
served using any static contents hosting service. For that purpose, you can also
use:

```script
yarn serve
```

# Code Quality

## 1. Linting

The coding style rules are defined by [Prettier](https://prettier.io/) and
enforced by [Eslint](https://eslint.org)

On top of this, we follow the rules set by the
[Javascript Standard Style](https://standardjs.com/rules.html).

You do not need to run the linting task manually, Webpack will take care of that
for you.

## 2. Git Hooks

We use [Husky](https://github.com/typicode/husky) to automatically deploy git
hooks.

On every `git commit` we check that images added to `static/img/*` do not exceed
10MB.


# reference

* [questdb.io](https://github.com/questdb/questdb.io)


# github aciton 

当前流程是自动编译项目，然后将build目录转发到服务器指定目录，此项目提交自动发布到服务器，无需二次上传，自动刷新nginx

* 如下为nginx配置

```
 location / {
               root   /data/github/fsharechat.cn/build;
               index  index.html index.htm;
               try_files $uri $uri/ /index.html =404;
        }

```

# 详细步骤

要在 GitHub Actions 中编译 Docusaurus 项目并将生成的构建目录（build）提交到指定服务器目录，可以按照以下步骤进行操作：

1. 在 Docusaurus 项目的根目录下创建一个名为 `.github/workflows/main.yml` 的文件。

2. 将以下内容复制到 `main.yml` 文件中：

```yaml
name: Build and Deploy Docusaurus

on:
  push:
    branches:
      - main  # 更改为您的主要分支名称

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install dependencies
        run: yarn install

      - name: Build Docusaurus
        run: yarn build

      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          password: ${{ secrets.SERVER_PASSWORD }}
          source: "build/"
          target: "/path/to/destination"  # 更改为您的目标服务器目录
```

3. 替换上述代码中的以下部分：
   - `branches` 字段：根据您的项目分支名称进行调整。
   - `target` 字段：将 `/path/to/destination` 更改为服务器上的目标目录路径。

4. 创建一个名为 `SERVER_HOST` 的 GitHub Secrets，将其值设置为目标服务器的主机名或 IP 地址。
   - 在 GitHub 仓库页面的右上角，依次点击 "Settings"、"Secrets"、"New repository secret"。
   - 设置名称为 `SERVER_HOST`，值为目标服务器的主机名或 IP 地址。

5. 创建 `SERVER_USERNAME` 和 `SERVER_PASSWORD` 两个 GitHub Secrets，将其分别设置为连接到目标服务器所需的用户名和密码。
   - 在 GitHub 仓库页面的右上角，依次点击 "Settings"、"Secrets"、"New repository secret"。
   - 设置名称为 `SERVER_USERNAME`，值为连接到目标服务器所需的用户名。
   - 设置名称为 `SERVER_PASSWORD`，值为连接到目标服务器所需的密码。

**NOTE:** 注意这里的一定要确认服务器用户名，密码是否正确

6. 将更改的代码和 Secrets 推送到 GitHub 仓库。

# 原理说明

当您推送到 GitHub 仓库的 `main` 分支时，GitHub Actions 将自动触发工作流程。该工作流程将在 Ubuntu 环境中运行，并执行以下操作：

- 检出仓库代码。
- 安装 Node.js。
- 安装项目的依赖项。
- 构建 Docusaurus 项目。
- 使用 SCP 将构建目录中的内容（build）上传到指定服务器目录。

请确保替换代码中的占位符，并根据服务器连接要求设置正确的 Secrets 值。