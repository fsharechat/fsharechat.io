
# fshare.io

[This website](https://comsince.cn/) is built using
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