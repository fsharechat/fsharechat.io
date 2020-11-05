const nodeFetch = require("node-fetch")

module.exports = (context) => ({
  name: "fetch-release",
  async loadContent() {
    // const response = await nodeFetch(
    //   `https://api.github.com/repos/questdb/questdb/releases/tags/${context.siteConfig.customFields.version}`,
    // )
    const data1 = {
      html_url: 'https://api.github.com/repos/fsharechat/electron-vue-chat/releases/tags/v0.0.18',
      published_at: '2020-11-05T13:52:20Z',
      assets:[{
        browser_download_url:'https://media.comsince.cn/minio-bucket-file-name/fshare-chat-linux.AppImage',
        name:'fsharechat-0.0.18-rt-linux-amd64.appImage',
        size:119835292
      },{
        browser_download_url:'https://media.comsince.cn/minio-bucket-file-name/fshare-chat-macos.dmg',
        name:'fsharechat-0.0.18-rt-osx-amd64.dmg',
        size:117980685
      },{
        browser_download_url:'https://media.comsince.cn/minio-bucket-file-name/fshare-chat-window.exe',
        name:'fsharechat-0.0.18-rt-windows-amd64.exe',
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
