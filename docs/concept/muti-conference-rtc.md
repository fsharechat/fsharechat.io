---
layout: post
title: 多人音视频会话方案预研
category: IM
description: im  muti-conference
---


本文主要说明多人音视频的工程技术方案选型,此文侧重于工程化实践,不讨论相关音视频编解码算法,旨在寻找一种适合中小型企业部署的多音视频方案以降低企业进行多人会议的成本.方案的选型主要还是适合现有的`飞享`聊天系统的相关技术栈,以便于能够对现有系统进行更快的集成.合理的方案最终满足企业对技术方案的可控,以及需要考虑框架周边的完善程度

## WebRTC多方方案概述

当媒体服务器充当媒体中继时，它通常被称为SFU（Selective Forwarding Unit选择性转发单位），这意味着其主要目的是在客户端之间转发媒体流。还有一个MCU（Multipoint Conferencing Unit多点会议单元）的概念，MCU服务器不仅可以转发，而且可以对媒体流进行混合和编码压缩（比如把各个客户端的数据打包转发，和SFU相比，这样将大幅度降低转发数据的带宽需求，但对CPU有更高的要求）。

![image](http://image.comsince.cn/webrtc-commuication-model.png)


### Mesh架构
每个端都与其它端互连。以上图最左侧为例，5个浏览器，二二建立p2p连接，每个浏览器与其它4个建立连接，总共需要10个连接。如果每条连接占用1m带宽，则每个端上行需要4m，下行带宽也要4m，总共带宽消耗20m。而且除了带宽问题，每个浏览器上还要有音视频“编码/解码”，cpu使用率也是问题，一般这种架构只能支持4-6人左右，不过优点也很明显，没有中心节点，实现很简单。

__优点：__

* 逻辑简单，容易实现
* 服务端比较 “轻量”，TURN 服务器比较简单，一定比例的 P2P 成功率可极大减轻服务端的压力

__缺点：__

* 每新增一个客户端，所有的客户端都需要新增一路数据上行，客户端上行带宽占用太大。因此，通话人数越多，效果越差
* 无法在服务端对视频进行额外处理，如：录制存储回放、实时转码、智能分析、多路合流、转推直播等等

### MCU (MultiPoint Control Unit)
这是一种传统的中心化架构(上图中间部分)，每个浏览器仅与中心的MCU服务器连接，MCU服务器负责所有的视频编码、转码、解码、混合等复杂逻辑，每个浏览器只要1个连接，整个应用仅消耗5个连接，带宽占用(包括上行、下行）共10m，浏览器端的压力要小很多，可以支持更多的人同时音视频通讯，比较适合多人视频会议。但是MCU服务器的压力较大，需要较高的配置。  

以前在电信行业做视频会议一般都使用MCU(Multipoint Control Unit)，也就是多方推流在MCU上进行合流，在拉流的时候只有一路合流，这样的好处是无论几方推流，拉流只有一路，下行带宽比较小。但是问题也比较多，只要推流方一多，MCU的压力就比较大，而且分布式的部署也比较难，成本又很高。

### SFU(Selective Forwarding Unit)
上图右侧部分，咋一看，跟MCU好象没什么区别，但是思路不同，仍然有中心节点服务器，但是中心节点只负责转发，不做太重的处理，所以服务器的压力会低很多，配置也不象MCU要求那么高。但是每个端需要建立一个连接用于上传自己的视频，同时还要有N-1个连接用于下载其它参与方的视频信息。所以总连接数为5*5，消耗的带宽也是最大的，如果每个连接1M带宽，总共需要25M带宽，它的典型场景是1对N的视频互动。  

SFU 服务器最核心的特点是把自己 “伪装” 成了一个 WebRTC 的 Peer 客户端，WebRTC 的其他客户端其实并不知道自己通过 P2P 连接过去的是一台真实的客户端还是一台服务器，我们通常把这种连接称之为 P2S，即：Peer to Server。除了 “伪装” 成一个 WebRTC 的 Peer 客户端外，SFU 服务器还有一个最重要的能力就是具备 one-to-many 的能力，即可以将一个 Client 端的数据转发到其他多个 Client 端。  

这种网络拓扑结构中，无论多少人同时进行视频通话，每个 WebRTC 的客户端只需要连接一个 SFU 服务器，上行一路数据即可，极大减少了多人视频通话场景下 Mesh 模型给客户端带来的上行带宽压力。  

SFU 服务器跟 TURN 服务器最大的不同是，TURN 服务器仅仅是为 WebRTC 客户端提供的一种辅助的数据转发通道，在 P2P 不通的时候进行透明的数据转发。而 SFU 是 “懂业务” 的， 它跟 WebRTC 客户端是平等的关系，甚至 “接管了” WebRTC 客户端的数据转发的申请和控制。  

现在互联网行业比较流行的是SFU(Selective Forwarding Unit)，简单说就是只负责转发流，不负责合流，压力很小。这样的模式可以依托CDN进行分布式的部署，不过拉流的方数限于客户端的带宽和处理能力。

## 为啥推荐选择 SFU ？
纯 mesh 方案无法适应多人视频通话，也无法实现服务端的各种视频处理需求，最先排除在商业应用之外。  

SFU 相比于 MCU，服务器的压力更小（纯转发，无转码合流），灵活性更好（可选择性开关任意一路数据的上下行等），受到更广泛的欢迎和应用，常见的开源 SFU 服务器有：`Licode`，`Kurento`，`Janus`，`Jitsi`，`Mediasoup`等。  

当然，也可以组合使用 SFU + MCU 的混合方案，以灵活应对不同场景的应用需要。


## 开源方案

### 流媒体选型要考虑的主要因素

* 你是否深刻理解其代码？
* 代码版本是否足够新？
* 有谁在使用它？
* 它的文档是否齐全？
* 它可以debug吗？
* 它可以伸缩吗？
* 它使用哪种语言？
* 对于媒体服务器而言，这种语言的性能是否足够？
* 团队是否足够了解这门语言？
* 是否适应你现有的Signaling范式？
* 你在看的Media Server是否容易与你决定使用的STUN/TURN服务器集成
* 许可证是否适合你？
* 谁在提供支持？
很多成功的、被良好维护的开源项目背后都有一个商业模式，尤其是中小型的项目，这意味着有一个团队以此为谋生手段。
具备可选的付费支持意味着：
  * 有人愿意全职来改善这东西，而不是作为爱好来维护。
  * 如果你需要紧急帮助，只要花钱就能得到。


### 我们最后为啥选择了Kurento？
* 开源
* 支持SFU和MCU
* 支持音视频流的转码，记录，混合，广播和路由
* 内置模块我们将来可以直接用
* API公开其所有功能，与语言无关，可以使用任何语言
* 可拔插框架，容易扩展
* 文档丰富，demo多
* 社区活跃度高

选择这个开源Media Server 主要是因为其完善的文档,基于Java的客户端API,方便集成现有的[unverse_push](https://github.com/comsince/universe_push)信令服务器


## 本地安装KMS

### 安装GPG

```shell
sudo apt-get update && sudo apt-get install --no-install-recommends --yes gnupg
```

### 确定Ubuntu版本

Run only one of these lines:

### 运行如下一行命令即可
```shell
DISTRO="xenial"  # KMS for Ubuntu 16.04 (Xenial)
DISTRO="bionic"  # KMS for Ubuntu 18.04 (Bionic)
```

### 添加Kurento 仓库地址

Run these two commands in the same terminal you used in the previous step:

```shell
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 5AFA7A83
sudo tee "/etc/apt/sources.list.d/kurento.list" >/dev/null <<EOF
# Kurento Media Server - Release packages
deb [arch=amd64] http://ubuntu.openvidu.io/6.13.0 $DISTRO kms6
EOF
```


## 安装KMS

```shell
sudo apt-get update && sudo apt-get install --yes kurento-media-server
```
以上命令会安装最新版本的KMS

## 启动与停止

```shell
sudo service kurento-media-server start
sudo service kurento-media-server stop
```


## 检验是否安装成功

### 检查进程是否存在

```shell
$ ps -fC kurento-media-server
UID        PID  PPID  C STIME TTY          TIME CMD
kurento  17799     1  0 17:45 ?        00:00:00 /usr/bin/kurento-media-server

```


### 检查websocket RPC端口是否存在 

```shell
$sudo netstat -tupln | grep -e kurento -e 8888
tcp6       0      0 :::8888                 :::*                    LISTEN      17799/kurento-media
```

### 测试websocket rpc链接

```shell
$curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Host: 127.0.0.1:8888" -H "Origin: 127.0.0.1" http://127.0.0.1:8888/kurento
```
## 返回结果

```
HTTP/1.1 500 Internal Server Error
Server: WebSocket++/0.7.0

```

**NOTE:** 此测试命令在sudo 命令下执行

# loopback 本地测试

这里使用回环测试,说明`kurento`的基本使用,主要结合信令服务器说明

**NOTE:** 下图是摘自官方文档的一个本地回环测试的架构图

![image](http://image.comsince.cn/kurento-java-tutorial-1-helloworld-pipeline.png)

有两个websocket链接这里说明一下:
* __一个是客户端与信息服务器通过websocket链接,用于信令交互__
* __一个是kurento java客户端与KMS之间的链接__

## 信令交互图

![image](http://image.comsince.cn/kurento-java-tutorial-1-helloworld-signaling.png)


## 一对一聊天
这里使用SFU服务器进行中间转发.说明SFU进行消息转发的基本使用方法

## SFU与直连会话的对比

### p2p模式
这种聊天方式,信令服务器只是中转信令,中间对信令的内容不需要感知,信令服务器只需要转发信令到指定接收者即可.

### 基于SFU的转发模式
本质是各个客户端与KMS建立链接.双方的sdp `offer/answer` 是各个客户端与KMS之间的协商,KMS伪装成`webRTC`客户端接收各个客户端的链接.然后内部进行消息的转发.

### 信令设计

**NOTE:** 如下图全新设计的信令交互图

![image](http://image.comsince.cn/one2oneSingnal.png)

以下事项需要注意:
* `CallStartmessage`和`AnswerCallMessage`,`Byemessage`需要转发到目标客户端
* `SignalMessage`只在客户端与信令服务器端转发,不需要转发到对端


## 群组聊天

## 信令设计

### 基于SFU的原始信令设计

* 新的参与者发送信令`joinRoom`,加入到群组聊天中
* 信令服务器处理`joinRoom`消息,向群组中的用户广播有新的参与者加入.并且给新参数返回群组现有的成员名单
* 新的参与者会接收到现有的群组成员名单
  * 建立推流通道,用于专门发送本地视频到KMS
  * 根据现有参与者,每一个参与者都建立一条拉流通道,用于分别接收群组中其他参与者的视频流

### 基于IM的群组视频聊天的信令设计
* 群组某个成员发起群组视频聊天,发起`CallStartMessage`,并等待加入者
* 被通知者收到接收到的群组音视频通知,决定是否接收群组视频邀请
* 如果被邀请者同意接收音视频邀请,则回应`callAnswerMessage`
* 信令服务器接收到用户接收请求邀请,分别给发起者发送`SignalMessage`包含新加入的用户,接收者发送包含正在音视频通话的列表的`SignalMessage`

## 交互设计  
* 群组中任何一个用户,点击语音或者视频聊天,之后选择要参与的用户,目前群聊用户初步限定为9人
* 一旦发起者建立群组会话,中间其他群组成员,不允许在进入,除非发起者邀请进入

## 技术实现

目前已经实现了基于vue web的群组音视频和基于android的群组音视频,详情请参考[飞享IM项目说明](https://github.com/fsharechat/Readme)


## 参考资料
* [互动直播之WebRTC服务开源技术选型](https://juejin.im/post/5eca3f15e51d45789129173e#heading-21)
* [WebRTC现状以及多人视频通话分析](https://juejin.im/post/5cb008c26fb9a068547345eb#heading-5)
* [kurento 官方文档](https://doc-kurento.readthedocs.io/en/6.13.0/user/installation.html)
* [架构设计：基于Webrtc、Kurento的一种低延迟架构实现](https://www.jianshu.com/p/ac307371def4)