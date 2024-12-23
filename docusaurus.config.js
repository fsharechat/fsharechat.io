const visit = require("unist-util-visit")
const ssrTemplate = require("./src/internals/ssr.template")

const githubOrgUrl = "https://github.com/fsharechat"
const domain = "https://fsharechat.github.io/"

const customFields = {
  artifactHubUrl: "https://github.com/fsharechat/fsharechat.io",
  copyright: `Copyright © ${new Date().getFullYear()} Fsharechat`,
  crunchbaseUrl: "https://github.com/fsharechat/fsharechat.io",
  description:
    "飞享IM 做技术自主可控的即时通讯IM",
  dockerUrl: "https://github.com/fsharechat/fsharechat.io",
  domain,
  githubOrgUrl,
  githubUrl: `${githubOrgUrl}`,
  helmVersion: "0.2.4",
  linkedInUrl: "https://www.linkedin.com/company/comsince/",
  oneLiner: "飞享IM 做技术自主可控的即时通讯IM",
  slackUrl: `https://slack.${domain}`,
  twitterUrl: "https://weibo.com/comsince",
  version: "0.0.47-beta",
}

function variable() {
  const RE_VAR = /{@([\w-_]+)@}/g
  const getVariable = (full, partial) =>
    partial ? customFields[partial] : full

  function textVisitor(node) {
    node.value = node.value.replace(RE_VAR, getVariable)
  }

  function linkVisitor(node) {
    node.url = node.url.replace(RE_VAR, getVariable)

    if (node.title) {
      node.title = node.title.replace(RE_VAR, getVariable)
    }
  }

  function transformer(ast) {
    visit(ast, "text", textVisitor)
    visit(ast, "code", textVisitor)
    visit(ast, "link", linkVisitor)
  }

  return transformer
}

const config = {
  title: "飞享IM-即时IM通讯系统 ",
  tagline: "FshareIM是一个技术自主可控即时IM通讯系统,适于私有化部署",
  url: `https://${customFields.domain}`,
  baseUrl: "/",
  favicon: "/img/favicon.png",
  organizationName: "fsharechat",
  projectName: "fsharechat.github.io",
  customFields,
  plugins: [
    require.resolve("./plugins/fetch-release"),
    require.resolve("./plugins/lint"),
    require.resolve("./plugins/manifest"),
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 100,
        steps: 2, // the max number of images generated between min and max (inclusive)
      },
    ],
    [
      "@docusaurus/plugin-pwa",
      {
        pwaHead: [
          {
            tagName: "link",
            rel: "icon",
            href: "/img/favicon.png",
          },
          {
            tagName: "link",
            rel: "manifest",
            href: "/manifest.webmanifest",
          },
          {
            tagName: "meta",
            name: "theme-color",
            content: "#d14671",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-capable",
            content: "yes",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-status-bar-style",
            content: "#21222c",
          },
          {
            tagName: "link",
            rel: "apple-touch-icon",
            href: "/img/favicon.png",
          },
          {
            tagName: "link",
            rel: "mask-icon",
            href: "/img/favicon.png",
            content: "#fff",
          },
          {
            tagName: "meta",
            name: "msapplication-TileImage",
            content: "/img/favicon.png",
          },
          {
            tagName: "meta",
            name: "msapplication-TileColor",
            content: "#21222c",
          },
        ],
      },
    ],
  ],
  themeConfig: {
    announcementBar: {
      id: "github-star",
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    image: "/img/og.png",
    gtag: {
      trackingID: "G-H6YPVFKWXP",
      anonymizeIP: true,
    },
    prism: {
      defaultLanguage: "questdb-sql",
      theme: require("./src/internals/prism-dracula"),
    },
    algolia: {
      apiKey: "39aa9d22a58c5ed5433bc0a538156654",
      indexName: "fsharechat",
    },
    navbar: {
      title: " ",
      logo: {
        alt: "fsharechat",
        src: "/img/navbar/fshare.svg",
      },
      items: [
        {
          label: "安装",
          position: "left",
          items: [
            {
              label: "Centos",
              to: "/docs/guide/centos/",
            },
            {
              label: "Ubuntu",
              to: "/docs/guide/ubuntu/",
            },
            {
              label: "Windows",
              to: "/docs/guide/windows/",
            },
          ],
        },
        {
          label: "文档",
          position: "left",
          to: "/docs/introduction/",
          activeBasePath: "docs",
        },
        {
          label: "博客",
          to: "/blog/",
          position: "left",
        },
        {
          label: "GitHub",
          className: "navbar__item--github",
          href: customFields.githubUrl,
          position: "right",
        }
      ],
    },
    footer: {
      links: [
        {
          title: "客户端下载",
          items: [
            {
              label: "Android客户端",
              to: "/client/",
            },
            {
              label: "PC客户端",
              to: "/getstarted/",
            },
            {
              label: "Web客户端",
              href: "https://web.fsharechat.cn",
            },
            {
              label: "Web移动端",
              href: "https://mobile.fsharechat.cn",
            },
          ],
        },
        {
          title: "飞享IM",
          items: [
            {
              label: "文档",
              to: "/docs/introduction/",
            },
            {
              label: "路线图",
              href: "https://github.com/orgs/fsharechat/projects/1",
            },
          ],
        },
        {
          title: "社区",
          items: [
            {
              label: "公众号",
              to: "/community/",
            },
            {
              label:"QQ群",
              to: "/community/",
            },
            {
              label: "微博",
              href: customFields.twitterUrl,
            },
          ],
        },
        

        {
          title: "更多",
          items: [
            {
              label: "博客",
              to: "/blog/",
            },
            {
              label: "GitHub",
              href: customFields.githubUrl,
            },
          ],
        },
      ],
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          remarkPlugins: [variable],
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: {
          remarkPlugins: [variable],
          feedOptions: {
            type: "all",
            copyright: customFields.copyright,
          },
          showReadingTime: true,
        },
        sitemap: {
          cacheTime: 600 * 1000, // 600 sec - cache purge period
          changefreq: "daily",
          priority: 0.7,
          trailingSlash: true,
        },
        theme: {
          customCss: require.resolve("./src/css/global.css"),
        },
      },
    ],
  ],
}

module.exports = {
  ...config,
  ssrTemplate: ssrTemplate(config),
}
