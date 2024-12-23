const nodeFetch = require("node-fetch")

module.exports = (context) => ({
  name: "fetch-release",
  async loadContent() {
    // const response = await nodeFetch(
    //   `https://api.github.com/repos/questdb/questdb/releases/tags/${context.siteConfig.customFields.version}`,
    // )
    const data1 = {
      html_url: 'https://api.github.com/repos/fsharechat/electron-vue-chat/releases/tags/v0.0.47-beta',
      published_at: '2024-11-17T11:00:00Z',
      assets:[{
        browser_download_url:'https://media.fsharechat.cn/minio-bucket-file-name/fshare-chat-linux.AppImage',
        name:'fsharechat-0.0.22-rt-linux-amd64.appImage',
        size:119835292
      },{
        browser_download_url:'https://media.fsharechat.cn/minio-bucket-file-name/fshare-chat-macos.dmg',
        name:'fsharechat-0.0.22-rt-osx-amd64.dmg',
        size:117980685
      },{
        browser_download_url:'https://media.fsharechat.cn/minio-bucket-file-name/fshare-chat-window.exe',
        name:'fsharechat-0.0.22-rt-windows-amd64.exe',
        size:85512736
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
