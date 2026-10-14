const nodeFetch = require("node-fetch")

module.exports = (context) => ({
  name: "fetch-release",
  async loadContent() {
    // const response = await nodeFetch(
    //   `https://api.github.com/repos/questdb/questdb/releases/tags/${context.siteConfig.customFields.version}`,
    // )
    // 安装包由 electron-vue-chat-pro 的 CI 发版时自动拷贝到 minio，文件名固定；发新版时更新这里的版本、日期和大小
    const data1 = {
      html_url: `${context.siteConfig.customFields.desktopRepoUrl}/releases/tag/v${context.siteConfig.customFields.version}`,
      published_at: '2026-10-14T01:06:04Z',
      assets:[{
        browser_download_url:'https://media.fsharechat.cn/minio-bucket-file-name/fshare-chat-linux.AppImage',
        name:'electron-vue-chat-pro-1.8.0-linux-x86_64.AppImage',
        size:114472815
      },{
        browser_download_url:'https://media.fsharechat.cn/minio-bucket-file-name/fshare-chat-macos.dmg',
        name:'electron-vue-chat-pro-1.8.0-osx-x64.dmg',
        size:111474070
      },{
        browser_download_url:'https://media.fsharechat.cn/minio-bucket-file-name/fshare-chat-window.exe',
        name:'electron-vue-chat-pro-1.8.0-windows-x64.exe',
        size:85125811
      }]
    };
    // const data = await response.json()
    return data1
  },
  async contentLoaded({ content, actions }) {
    const { setGlobalData } = actions
    setGlobalData({ release: content })
  },
})
