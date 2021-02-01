let guidelines

if (process.env.NODE_ENV === "development") {
  guidelines = {
    label: "Guidelines (DEV ONLY)",
    type: "category",
    items: [
      {
        type: "category",
        label: "Templates",
        items: [
          "__guidelines/template/guide",
          "__guidelines/template/function",
          "__guidelines/template/sql",
        ],
      },
      "__guidelines/naming-convention",
      "__guidelines/content-hierarchy",
      "__guidelines/lexicon",
      "__guidelines/markdown",
      "__guidelines/sql-code-blocks",
      "__guidelines/influences",
    ],
  }
}

module.exports = {
  docs: [
    guidelines,
    {
      id: "introduction",
      type: "doc",
    },
    {
      label: "系统架构",
      type: "category",
      collapsed: false,
      items: [
        "concept/tech-doc",
        "concept/web-rtc-intro",
        "concept/muti-conference-rtc",
        "concept/delivery-read-report"
      ],
    },
    {
      label: "安装准备",
      type: "category",
      collapsed: false,
      items: [
        "prepare/mysql",
        "prepare/minio",
        "prepare/cert",
        "prepare/nginx",
        "prepare/coturn"
      ],
    },
    {
      label: "安装指南",
      type: "category",
      collapsed: false,
      items: [
        "guide/centos",
        "guide/ubuntu",
        "guide/windows",
        "guide/cluster",
        "guide/checklist"
      ],
    },{
      label: "开放接口",
      type: "category",
      collapsed: false,
      items: [
        "api/pushapi",
      ],
    },{
      label: "服务咨询",
      type: "category",
      collapsed: false,
      items: [
        "consult/contact",
      ],
    }   
  ].filter(Boolean),
}
