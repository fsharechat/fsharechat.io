---
layout: post
title: 实时音视频开发的工程化实践
category: IM
description: 
---

这里只是根据实时音视频开发，说明技术的路线，主要展示该技术得以工程应用需要的理论背景。该篇不是主要将实时音视频的所涉及的音视频相关的理论知识，由于实时音视频的相关的处理算法并不是本篇内容的关注重点，这里只是重点从工程角度说明`WebRTC`这项技术在简化实时音视频方面带来的帮助，然后围绕这项技术说明在服务端，客户端领域我们需要理解哪些工程化问题

> 基于平台的 API 做应用开发，并不是一个可以走得多远的方向，真正有价值的地方在于与具体的业务方向结合。这个是业务领域精通的指导思想，所有的技术都要找到相应的落地点

## 网络基础
  TCP/IP网络基础，IP路由，网络分层，以及数据如何自顶而下实现传输

## WebRTC实时音视频技术的整体架构介绍
  对webRTC整体技术有所了解，进而进一步了解我主要的学习重点，以及我们在开发实时聊天时需要解决的问题，可以参考这篇文章[WebRTC实时音视频技术的整体架构介绍](http://www.52im.net/thread-284-1-1.html)
  > WebRTC技术架构图

  ![image](https://media.comsince.cn/minio-bucket-image-name/111321jf5oiev7fnznfnon.png)

## WebRTC服务器
  理解实时语音通信相关的通信策略，如何进行呼叫应答。也即是在建立媒体流之前如何进行对端链接，这需要信令服务器与turn服务器的配合

### WebRTC协议概述

#### 理解p2p穿透技术

* [P2P技术之STUN、TURN、ICE详解](http://www.52im.net/thread-557-1-1.html)

#### WebRTC协议
##### NAT
网络地址转换协议Network Address Translation (NAT) 用来给你的（私网）设备映射一个公网的IP地址的协议。一般情况下，路由器的WAN口有一个公网IP，所有连接这个路由器LAN口的设备会分配一个私有网段的IP地址（例如192.168.1.3）。私网设备的IP被映射成路由器的公网IP和唯一的端口，通过这种方式不需要为每一个私网设备分配不同的公网IP，但是依然能被外网设备发现。

一些路由器严格地限定了部分私网设备的对外连接。这种情况下，即使STUN服务器识别了该私网设备的公网IP和端口的映射，依然无法和这个私网设备建立连接。这种情况下就需要转向TURN协议。

##### STUN
NAT的会话穿越功能Session Traversal Utilities for NAT (STUN) (缩略语的最后一个字母是NAT的首字母)是一个允许位于NAT后的客户端找出自己的公网地址，判断出路由器阻止直连的限制方法的协议。

客户端通过给公网的STUN服务器发送请求获得自己的公网地址信息，以及是否能够被（穿过路由器）访问。

![image](https://media.comsince.cn/minio-bucket-image-name/webrtc-stun.png)

##### TURN
一些路由器使用一种“对称型NAT”的NAT模型。这意味着路由器只接受和对端先前建立的连接（就是下一次请求建立新的连接映射）。

NAT的中继穿越方式Traversal Using Relays around NAT (TURN) 通过TURN服务器中继所有数据的方式来绕过“对称型NAT”。你需要在TURN服务器上创建一个连接，然后告诉所有对端设备发包到服务器上，TURN服务器再把包转发给你。很显然这种方式是开销很大的，所以只有在没得选择的情况下采用。

![image](https://media.comsince.cn/minio-bucket-image-name/webrtc-turn.png)

##### ICE

交互式连接设施Interactive Connectivity Establishment (ICE) 是一个允许你的浏览器和对端浏览器建立连接的协议框架。在实际的网络当中，有很多原因能导致简单的从A端到B端直连不能如愿完成。这需要绕过阻止建立连接的防火墙，给你的设备分配一个唯一可见的地址（通常情况下我们的大部分设备没有一个固定的公网地址），如果路由器不允许主机直连，还得通过一台服务器转发数据。ICE使用以上技术实现

### 信令与视频通话
描述信令服务器在实现点对点视频通话的作用，说明如何协商并建立通话链接，详情参考[信令与视频通话](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Signaling_and_video_calling)
> 这篇文章介绍ice协议框架与与信令服务在通信中扮演的角色[WebRTC 入门教程（二）WebRTC信令控制与STUN/TURN服务器搭建](https://rtcdeveloper.com/t/topic/13742)

信令服务器在其中扮演中重要角色，因此良好的实时通讯信令设计，决定一个实时音视频通讯的关键，需要信令服务器帮助通信两端建立链接，下图为链接的流程图

![image](https://media.comsince.cn/minio-bucket-image-name/webrtc-signal-process.png)

### 信令交换流程
> 所有的程序逻辑都围绕这个信令交换流程进行代码编写，因此理解信令交换流程至关重要，前面已经对信令服务器,Stun,turn服务器做过简单介绍，现在主要说明它们之间是如何进行协同工作的

#### 信令事务流程
![image](https://media.comsince.cn/minio-bucket-image-name/WebRTC%20-%20Signaling%20Diagram.svg)
#### ICE 候选交换过程
![image](https://media.comsince.cn/minio-bucket-image-name/WebRTC%20-%20ICE%20Candidate%20Exchange.svg)

**NOTE:** 详情请参考：[信令与视频通话](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Signaling_and_video_calling)
## 实践

### 熟悉WebRTC相关API
* [WebRTC API](https://javascript.ruanyifeng.com/htmlapi/webrtc.html#toc1)

> 学习相关平台的API，如何采集本地音视频资源显示，如何进行候选通知，详情参考[webrtc-samples](https://github.com/webrtc/samples)

### 定义通话信令格式

### web-rtc核心API流程
> 这里以js相关接口说明其核心流程，Android版本api基本类似

* 创建peerConnection  

创建peerConnection，建立与Turn服务器链接，此时应该设置相关的callback回调事件监听相关的事件生成回调，具体如下：
```js
async createPeerConnection() {
        this.log("Setting up a connection...");
      
        // Create an RTCPeerConnection which knows to use our chosen
        // STUN server.
      
        this.myPeerConnection = new RTCPeerConnection({
          iceServers: [     // Information about ICE servers - Use your own!
            {
              urls: "turn:turn.liyufan.win:3478",  // A TURN server
              username: "wfchat",
              credential: "wfchat"
            }
          ]
        });
      
        // Set up event handlers for the ICE negotiation process.
      
        this.myPeerConnection.onicecandidate = this.handleICECandidateEvent;
        this.myPeerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
        this.myPeerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
        this.myPeerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
        this.myPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
        this.myPeerConnection.ontrack = this.handleTrackEvent;
}
```

* 设置track以启动ICE协商

> 众所周知，要想启动ICE协商，必须将音视频流加入到`peerconnection`中，这样才能促发`handleNegotiationNeededEvent`事件回调，加入track事件代码如下：

```js
try {
          this.webcamStream.getTracks().forEach(
            this.transceiver = track => this.myPeerConnection.addTransceiver(track, {streams: [this.webcamStream]})
          );
    } catch(err) {
          this.handleGetUserMediaError(err);
    }
```

### 消息交互流程

* 发送者发送`CallStartMessage`给接收者，并启动启动video track进行视频预览
* 接收者接收`CallStartMessage`,开启会话，弹出视频会话窗口，等待用户确定是否接收音视频请求
* 接收者如果同意接听，则发送`AnswerTMessage`，`AnswerMessage`，之后创建`peerconnection`，接收回调sdp成功回调，发送`offer` signal信息，载体为`SignalMessage`
* 发送者接收到`offer`消息，设置remoteDescription之后，创建`answer` signal消息，发送给对端
* 接收端收到`answer`消息，设置remoteDescription
* 交换ICE信息

> SignalMessage定义如下

```json
{
	"type": "offer",//类型包括offer,answer,icecandidate
	"sdp": ""
}


{
	"sdp": "v=0\r\no=- 6357572066912248814 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS ARDAMS\r\nm=audio 9 UDP\/TLS\/RTP\/SAVPF 111 103 9 102 0 8 105 13 110 113 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:gvbe\r\na=ice-pwd:OWS+1ww1NcGoreyoLqlrEtKJ\r\na=ice-options:trickle renomination\r\na=fingerprint:sha-256 14:9A:43:E9:AF:D6:E9:81:63:61:7F:6E:49:32:CE:BB:32:7C:8A:4B:EB:5F:D7:94:AF:A9:D9:B5:0C:B6:91:BE\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus\/48000\/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=rtpmap:103 ISAC\/16000\r\na=rtpmap:9 G722\/8000\r\na=rtpmap:102 ILBC\/8000\r\na=rtpmap:0 PCMU\/8000\r\na=rtpmap:8 PCMA\/8000\r\na=rtpmap:105 CN\/16000\r\na=rtpmap:13 CN\/8000\r\na=rtpmap:110 telephone-event\/48000\r\na=rtpmap:113 telephone-event\/16000\r\na=rtpmap:126 telephone-event\/8000\r\na=ssrc:3585782204 cname:qXVJW4Pt43RfNLoC\r\na=ssrc:3585782204 msid:ARDAMS ARDAMSa0\r\na=ssrc:3585782204 mslabel:ARDAMS\r\na=ssrc:3585782204 label:ARDAMSa0\r\nm=video 9 UDP\/TLS\/RTP\/SAVPF 100 96 97 98 99 101 127 124 104 125\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:gvbe\r\na=ice-pwd:OWS+1ww1NcGoreyoLqlrEtKJ\r\na=ice-options:trickle renomination\r\na=fingerprint:sha-256 14:9A:43:E9:AF:D6:E9:81:63:61:7F:6E:49:32:CE:BB:32:7C:8A:4B:EB:5F:D7:94:AF:A9:D9:B5:0C:B6:91:BE\r\na=setup:actpass\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/abs-send-time\r\na=extmap:4 urn:3gpp:video-orientation\r\na=extmap:5 http:\/\/www.ietf.org\/id\/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:6 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/playout-delay\r\na=extmap:7 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/video-content-type\r\na=extmap:8 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/video-timing\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8\/90000\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtpmap:97 rtx\/90000\r\na=fmtp:97 apt=96\r\na=rtpmap:98 VP9\/90000\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=rtpmap:99 rtx\/90000\r\na=fmtp:99 apt=98\r\na=rtpmap:100 H264\/90000\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=fmtp:100 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:101 rtx\/90000\r\na=fmtp:101 apt=100\r\na=rtpmap:127 red\/90000\r\na=rtpmap:124 rtx\/90000\r\na=fmtp:124 apt=127\r\na=rtpmap:104 ulpfec\/90000\r\na=rtpmap:125 flexfec-03\/90000\r\na=rtcp-fb:125 goog-remb\r\na=rtcp-fb:125 transport-cc\r\na=fmtp:125 repair-window=10000000\r\na=ssrc-group:FID 4087522884 3825769918\r\na=ssrc-group:FEC-FR 4087522884 2385199861\r\na=ssrc:4087522884 cname:qXVJW4Pt43RfNLoC\r\na=ssrc:4087522884 msid:ARDAMS ARDAMSv0\r\na=ssrc:4087522884 mslabel:ARDAMS\r\na=ssrc:4087522884 label:ARDAMSv0\r\na=ssrc:3825769918 cname:qXVJW4Pt43RfNLoC\r\na=ssrc:3825769918 msid:ARDAMS ARDAMSv0\r\na=ssrc:3825769918 mslabel:ARDAMS\r\na=ssrc:3825769918 label:ARDAMSv0\r\na=ssrc:2385199861 cname:qXVJW4Pt43RfNLoC\r\na=ssrc:2385199861 msid:ARDAMS ARDAMSv0\r\na=ssrc:2385199861 mslabel:ARDAMS\r\na=ssrc:2385199861 label:ARDAMSv0\r\n",
	"type": "offer"
}
```

* ICE candidate

```json
{
	"type": "candidate",
	"label": "",
	"id": "",
	"candidate": ""
}
```

### 音视频会话交互状态
> 重点解决同一用户不同会话可能会出现的同时收到接听电话，可能造成的非一对一通话问题。音视频通信信令都是透传消息，且跟普通消息不一样，不再进行当前用户同步，也即时透传消息不向自己发送
对于音视频消息组织同一用户的不同session发起的会话。

#### 发送者

* 发送者发起通话请求，修改状态为`OUTGOING`
* 如果对方同意接听，接收者会收到answer消息，这时将消息设置为`CONNECTING`，如果此时发送者存在多用户会话，在接收到answer消息后，会检查状态是否为`OUTGOING`,否则结束会话


#### 接收者
* 接收对方发起的callStart消息，如果此时正在接听，则拒绝接听此时发起的会话，否则将此时状态设置为`STATUS_INCOMING`

## 参考资料

* [新手入门：到底什么是WebRTC服务器，以及它是如何联接通话的？](http://www.52im.net/thread-356-1-1.html)
* [WebRTC实时音视频技术基础：基本架构和协议栈](http://www.52im.net/thread-442-1-1.html)
* [WebRTC　简介](https://mp.weixin.qq.com/s/NsiU8rVYYMbDjVBGZlr3Xg)
* [【音视频开发】开发小白如何成为音视频专家？](https://zhuanlan.zhihu.com/p/31717622)