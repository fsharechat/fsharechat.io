---
layout: post
title: "即时聊天系统技术文档"
description: IM TECH
category: IM
---

本文档主要说明飞享即时聊天系统的技术相关文档,用于支持其他多端开发.说明系统的整体架构与后续技术`发展规划`,`技术愿景`,`未来商业化支持`

:::danger
本文未经授权禁止转载
:::

## 概述
飞享是一个即时聊天系统整体解决方案,更像一个开箱即用的即时通讯产品化解决方案.在设计之初,尽量遵照平台原生开发的要求进行,因为我们始终觉得原生的体验是达到一个优秀即时通讯的基本要求.在对客户端,服务端设计的过程中,尽量采用业界通用的方案进行.不用过于依赖某项技术,因为我们任何只有合适的技术用在合适的系统上才能发挥它固有的价值.

初衷开始这个项目只是对即时通讯的喜爱,慢慢不断的发展成为一个即时通讯类产品,在功能的不断迭代中,需要我们停下脚本思考一些问题.更希望这个一个技术解决方案,而不是基于某种语言或者框架的解决方案.也是服务端通信框架是基于`t-io`(基于AIO的网络编程框架,提供便捷的API,方便管理,快速使用),或者是基于`Netty`(基于NIO的异步网络编程框架).也是服务端编程语言是基于`Java`或者是基于`Go`.技术本身是为了解决实际问题,不应该是限制具体某个领域的发展.在编写客户端应用时,可以支持`Android`,也可以支持`iOS`,可以支持`Web`.支持我们遵循我们设计的交互协议规范,这些都可以迎刃而解,不管你是采用Android或者iOS原生开发,还是跨平台开发,使用Js框架Vue,React.


## 系统架构

系统架构在以后更多的是解决用户不断增多进而导致的,硬件支持,软件支持.更多的用户带来的挑战包括不断增长的数据,需要不断优化的用户体验.功能的迭代带来系统复杂度不断增大,给软件架构带来更多的挑战.所以基于我们现在的简单分布式架构,解决小部分用户使用尚可,后续需要考虑更多的用户,更优的用户体验,因此需要不断的优化软件架构

**NOTE:** 如下为简要的系统部署图

![image](http://image.comsince.cn/push-universe-deploy.png)


## 系统流程图

![image](http://image.comsince.cn/push-universe-flow.png)

重点关注核心要点:`登录实现`,`消息不丢失设计`

### 登录设计
系统登录是进行用户管理的关键,现行设计采用`手机号`+`验证码`的方式进行,登录的目地是生成会话,以支持同一帐号不同设备登录的功能

#### 用户token生成
**NOTE:** 每一个用户Id登录不同设备,采用不同的cid,即是采用uid(用户id)+cid(设备唯一id)生成session,token中间分隔符为`|`

##### token规则

usertoken | session secret | db secret

##### usertoken规则

testim | 时间戳 | 用户名

* 核心代码

```java
    public static String getToken(String username) {
        String signKey = KEY + "|" + (System.currentTimeMillis()) + "|" + username;
        try {
            return DES.encryptDES(signKey);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
```


* 返回的token是经过AES加密然后Base64编码

#### 客户端接入方式

**NOTE:** 用户登录成功后,会成功获取到上面生成的token,例如web端在获取到这个`token`保存在浏览器的`localstorage`里面.这个toekn将作为后续发送验证请求的关键.登录成功后要发送`connect`信令进行链接验证,关于信令的传输将会在下面介绍

![image](http://image.comsince.cn/push-universe-flow.png)

#### 解密分离token

上面已经知道token是三部分加密组成,因此这里需要解密token,得到如下三部分内容
* usertoken
* session secret
* db secret

#### 生成密码

**NOTE:** 以下是发送`connect`信令携带的消息体

```js
{
    userName: LocalStore.getUserId(), //用户id
    password: pwdAesBase64, //生成的用户密码
    clientIdentifier: localStorage.getItem(KEY_VUE_DEVICE_ID) //当前用户登录设备唯一id
}
```

#### 生成规则

password 为 usertoken使用session secret经过AES加密得出的.

#### 服务端认证

客户端在传入上述的`connect`消息后,需要经过消息认证才算接入成功,每次用户会话都有一个session,利用session secret
对`password`字段进行AES解密,如果能够解密成功,则表示登录验证成功



## 系统接口文档

系统的接入方式多种多样,带来的挑战是需要支持多种接入方式.对于Android,ios需要基于TCP实现用户长链接,保证消息即时可达.因此需要设计私有协议,
对于web端,可以采用websocket协议,只需要在消息体中设计我们的消息格式即可.

### 私有二进制协议

```
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2
+---------------+---------------+---------------+---------------+
|      magic(8) |   version(8)  |   signal(8)   |               |
+---------------+---------------+---------------+---------------+
|                          length(32)                           | 
+---------------+---------------+---------------+---------------+
|   subsignal(8)|       messageId(16)           |  paload data  :
+---------------+---------------+---------------+---------------+
:             payload data(length)                              :
+---------------+---------------+---------------+---------------+
```

**NOTE:** 参数说明如下

* __magic__ 魔数,用于标记消息的起始位置
* __version__  协议版本号
* __signal__   主消息信令
* __length__   消息体长度
* __subsignal__ 消息子信令
* __messageId__ 消息ID，用于标记当前消息，可用作消息确认
* __payload data__ 消息体,长度由`length`定义

#### 信令定义说明

**NOTE:** 如下是主信令与子信令对应关系

<table>
    <tr>
        <th>主信令</th>
        <th>子信令</th>
        <th>信令说明</th>  
    </tr >
    <tr>
        <td >PING</td>
        <td>无</td>
        <td>心跳主信令</td>
    </tr>
    <tr>
        <td >PUSH</td>
        <td>无</td>
        <td>推送消息主信令</td>
    </tr>
    <tr>
        <td rowspan="8">CONNECT</td>
        <td>CONNECTION_ACCEPTED</td>
        <td>接受链接</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_UNACCEPTABLE_PROTOCOL_VERSION</td>
        <td>不可接受的协议</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_IDENTIFIER_REJECTED</td>
        <td>用户拒绝</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_SERVER_UNAVAILABLE</td>
        <td>服务不可用</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_BAD_USER_NAME_OR_PASSWORD</td>
        <td>用户名或密码错误</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_NOT_AUTHORIZED</td>
        <td>没有授权</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_UNEXPECT_NODE</td>
        <td>节点拒绝链接</td>
    </tr>
    <tr>
        <td>CONNECTION_REFUSED_SESSION_NOT_EXIST</td>
        <td>会话不存在</td>
    </tr>
    <tr>
        <td >DISCONNECT</td>
        <td>无</td>
        <td>心跳主信令</td>
    </tr>
    <tr>
        <td >CONNECT_ACK</td>
        <td>无</td>
        <td>心跳主信令</td>
    </tr>
    <tr >
        <td rowspan="23">PUBLISH</td>
        <td>US</td>
        <td>用户搜索</td>
    </tr>
    <tr>
        <td>FAR</td>
        <td>朋友添加请求</td>
    </tr>
    <tr>
        <td>UPUI</td>
        <td>用户信息</td>
    </tr>
    <tr>
        <td>FRN</td>
        <td>朋友添加通知</td>
    </tr>
    <tr>
        <td>FRP</td>
        <td>拉取朋友请求</td>
    </tr>
    <tr>
        <td>FHR</td>
        <td>处理朋友申请</td>
    </tr>
    <tr>
        <td>FP</td>
        <td>获取朋友列表</td>
    </tr>
    <tr>
        <td>MN</td>
        <td>消息通知</td>
    </tr>
    <tr>
        <td>MS</td>
        <td>发送消息</td>
    </tr>
    <tr>
        <td>MP</td>
        <td>获取消息</td>
    </tr>
    <tr>
        <td>FN</td>
        <td>朋友添加通知</td>
    </tr>
    <tr>
        <td>GC</td>
        <td>创建群组</td>
    </tr>
    <tr>
        <td>GPGI</td>
        <td>获取群组信息</td>
    </tr>
    <tr>
        <td>GPGM</td>
        <td>获取群组成员</td>
    </tr>
    <tr>
        <td>GAM</td>
        <td>添加群组成员</td>
    </tr>
    <tr>
        <td>GKM</td>
        <td>移除群组成员</td>
    </tr>
    <tr>
        <td>GQ</td>
        <td>退出群组</td>
    </tr>
    <tr>
        <td>GMI</td>
        <td>修改群组信息</td>
    </tr>
    <tr>
        <td>MMI</td>
        <td>修改个人信息</td>
    </tr>
    <tr>
        <td>GQNUT</td>
        <td>获取上传文件token</td>
    </tr>
    <tr>
        <td>MR</td>
        <td>消息撤回</td>
    </tr>
    <tr>
        <td>RMN</td>
        <td>远程消息通知</td>
    </tr>
    <tr>
        <td>LRM</td>
        <td>拉取历史消息</td>
    </tr>
    <tr>
        <td >PUB_ACK</td>
        <td>确认主信令</td>
        <td>子信令同上面Publish的子信令，这里不再一一列出</td>
    </tr>
</table>


#### 信令交互路程

信令交互流程主要是指如何使用以上的信令进行业务处理，信令的设计都采用的发送确认机制，例如客户端发送`connect`信令后，正常情况下都会受到服务器返回的ack确认指令，这里就是`connect_ack`.
下面主要针对`PUBLISH`信令说明，因为这个主信令下面有比较多的子信令，每个信令的具体含义已经在上面做了相应的说明。下面主要来说明具体业务是如何交互的。下面以发送消息说明

* 客户端构造信令消息体，此时**signal**为**PUSHLISH**，子信令为**MS**，代表用户需要发送消息
* 服务端接收到消息后解析指令，根据子信令处理相应的业务逻辑。处理成功后，服务端构造**PUSH__ACK**确认消息，此时主信令就是`PUSH_ACK`，子信令依旧保持不变为`MS`
* 客户端收到确认指令后，根据返回的子消息信令进行后续的业务处理
* 由于信令支持messageId,用户可以根据messageId,确认是否是之前的消息，可以用其实现异步消息转为同步处理


### 基于websocket的消息体信令设计

由于web端采用的是websocket协议，所有我们只需要定义传输消息体格式既可，如下为websocket消息通讯的Json格式定义

```json
{
    "signal": "connect", //主信令
    "sub_signal": "conect_ack", //子信令
    "message_id": 0,  //消息id
    "content": ""     //消息体
}
```

**NOTE：** 这里的Json格式定义有点类似二进制通讯协议，只不过由于websocket协议本身定义了消息头，消息长度，因为不需要我们自己处理，因此我们只需要关注以上字段既可

### 基于消息信令的交互方式

业务交互主要是基于`PUBLISH`与`PUB_ACK`模式进行的,使用子信令进行业务类型区分,例如发送请求用户信息,websocket协议Json格式为
```json
{
    "signal": "PUBLISH", //主信令
    "sub_signal": "UPUI", //子信令
    "message_id": 0,  //消息id
    "content": ["userids"]     //用户id列表
}
```

了解完业务消息设计定义,你可以参考`unverse_push`项目的中`push-connector`中`com.comsince.github.websocket.model`包中定义的数据格式进行分析,了解不同业务信令下的数据格式定义

### 发送消息体结构

这里把发送消息体的定义单独列出来说明,是因为`MS`子信令的消息体结构设计跟上面的基本业务数据结构有很大的不同,有必要单独拿出来说明.这个这个消息体定义了发送聊天消息的各种类型,其也是以后作为扩展消息所必须要知道的数据结构

**NOTE:** 以下是发送一个文本消息完整消息体

```json
{
    "signal": "PUBLISH",
    "subSignal": "MS",
    "messageId": 81,
    "content": {
        "from": "4A4A4Aaa",
        "content": {
            "type": 1,
            "searchableContent": "1234",
            "pushContent": "",
            "content": "",
            "binaryContent": "",
            "localContent": "",
            "mediaType": 0,
            "remoteMediaUrl": "",
            "localMediaPath": "",
            "mentionedType": 0,
            "mentionedTargets": []
        },
        "messageId": 1589944408832,
        "direction": 0,
        "status": 0,
        "messageUid": 0,
        "timestamp": 1589944408832,
        "to": "",
        "conversationType": 0,
        "target": "d9dRdRoo",
        "line": 0
    }
}
```

主信令与子信令含义不再描述,这里重点说明`content`消息定义,

**下图为消息定义参数对照表**

<table>
    <tr>
        <th>字段名称</th>
        <th>子字段</th>
        <th>字段描述</th>  
    </tr >
    <tr>
        <td>from</td>
        <td>无</td>
        <td>来源</td>
    </tr>
    <tr>
        <td>messageId</td>
        <td>无</td>
        <td>消息id,发送时随机生成</td>
    </tr>
    <tr>
        <td>direction</td>
        <td>无</td>
        <td>消息方向,接收还是发送</td>
    </tr>
    <tr>
        <td>status</td>
        <td>无</td>
        <td>推送转台</td>
    </tr>
    <tr>
        <td>messageUid</td>
        <td>无</td>
        <td>消息唯一Id,由服务端返回</td>
    </tr>
    <tr>
        <td>timestamp</td>
        <td>无</td>
        <td>消息时间戳</td>
    </tr>
    <tr>
        <td>to</td>
        <td>无</td>
        <td>目标</td>
    </tr>
    <tr>
        <td >conversationType</td>
        <td>无</td>
        <td>会话类型,单聊/群组</td>
    </tr>
    <tr>
        <td >target</td>
        <td>无</td>
        <td>目标接收者Id</td>
    </tr>
    <tr>
        <td >line</td>
        <td>无</td>
        <td>线路</td>
    </tr>
    <tr>
        <td rowspan="11">content</td>
        <td>type</td>
        <td>消息内容类型</td>
    </tr>
    <tr>
        <td>searchableContent</td>
        <td>可供搜索的文本内容</td>
    </tr>
    <tr>
        <td>pushContent</td>
        <td>推送内容</td>
    </tr>
    <tr>
        <td>content</td>
        <td>内容</td>
    </tr>
    <tr>
        <td>binaryContent</td>
        <td>二进制消息内容,经过编码</td>
    </tr>
    <tr>
        <td>localContent</td>
        <td>消息本地内容</td>
    </tr>
    <tr>
        <td>mediaType</td>
        <td>媒体类型</td>
    </tr>
    <tr>
        <td>remoteMediaUrl</td>
        <td>媒体远程url,例如图片,视频,文件url</td>
    </tr>
    <tr>
        <td>localMediaPath</td>
        <td>本地媒体文件路径</td>
    </tr>
    <tr>
        <td>mentionedType</td>
        <td>提及类型</td>
    </tr>
    <tr>
        <td>mentionedTargets</td>
        <td>提及的对象ID</td>
    </tr>
    
</table> 

**NOTE:** 消息最终发送时,都会转化为Json格式,下面给出几个消息类型的示例

#### 纯文本消息

```json
{
    "signal": "PUBLISH",
    "subSignal": "MS",
    "messageId": 82,
    "content": {
        "from": "4A4A4Aaa",
        "content": {
            "mentionedType": 0,
            "mentionedTargets": [],
            "type": 1,
            "searchableContent": "纯文本消息"
        },
        "messageId": 1589955328518,
        "direction": 0,
        "status": 0,
        "messageUid": 0,
        "timestamp": 1589955328518,
        "to": "",
        "conversationType": 0,
        "target": "d9dRdRoo",
        "line": 0
    }
}
```

#### 图片类型消息

```json
{
    "signal": "PUBLISH",
    "subSignal": "MS",
    "messageId": 84,
    "content": {
        "from": "4A4A4Aaa",
        "content": {
            "mentionedType": 0,
            "mentionedTargets": [],
            "type": 3,
            "searchableContent": "[图片]",
            "binaryContent": null,
            "mediaType": 1,
            "remoteMediaUrl": "http://image.comsince.cn/1-4A4A4Aaa-1589955429816-push-universe.png",
            "localMediaPath": ""
        },
        "messageId": 1589955430361,
        "direction": 0,
        "status": 0,
        "messageUid": 0,
        "timestamp": 1589955430361,
        "to": "",
        "conversationType": 0,
        "target": "d9dRdRoo",
        "line": 0
    }
}
```

**NOTE:** 与文本消息的区别在图片类消息携带的是图片的`remoteMediaUrl`,`type`类型为3,注意对于一些内容为空的字段进行省略

#### 通知类消息

通知类消息,例如`加群通知`,`退群通知`,`撤回消息`


* 移除群组成员的通知类消息

```json
{
    "content": {
        "binaryContent": "eyJnIjoiYm9iQ2JDUFAiLCJvIjoiVllWTFZMMjIiLCJtcyI6WyJkemRKZEpfXyJdfQ==",
        "content": "",
        "mediaType": 0,
        "mentionedType": 0,
        "pushContent": "",
        "remoteMediaUrl": "",
        "searchableContent": "",
        "type": 106
    },
    "conversationType": 1,
    "direction": 0,
    "from": "VYVLVL22",
    "line": 0,
    "messageId": 157747907456403130,
    "messageUid": 0,
    "status": 0,
    "target": "bobCbCPP",
    "timestamp": 1589956063904
}
```

#### 消息类型扩展说明

为了以后能够支持更多的消息类型,支持更多的展示方式,本质还是定义出更多type类型的消息,例如可以添加相应的`商品链接消息`,展示`用户文章类分享`,这些都可以通过以上的数据结构扩展


## 音视频通讯

**NOTE:** 目前只支持一对一音视频通话
音视频通话详见: [实时音视频开发的工程化实践](web-rtc-intro)

**NOTE:** 进行音视频前,请先检查浏览器的支持情况,可以打开此链接[检测](https://www.qcloudtrtc.com/webrtc-samples/abilitytest/index.html)


## 系统规划

### 系统架构设计
系统会随着主流软件设计逐步进行架构设计,主要对系统的主要性能瓶颈进行一定的重新设计,例如接入用户数如何水平扩展,如果保证用户消息的大规模存储.
并尽量保证最具竞争力的设计,实现在即时通讯领域应用最新的技术架构,实现业务的稳步提升

### 多端开发系统体验
在用户体验上,尽量使用原生开发,当然在这些基础上,可以使用小程序开发,方便大家快速体验系统功能.系统体验上,尽量追求,普通大众最能接收的设计.

### 可扩展性
相信很多用户可能对系统在实际应用中的效果并不满意,因此考虑系统的可扩展性,二次开发的便利性,需要提升

### 接入方便
服务端接入包括两种,基于TCP的二进制协议,web端基于websocket,为了简化接入人员的接入工作量,可以提供包括`Android`,`IOS`,`Web`的端的SDK,提供基础用于socket编程的基础sdk,包含信令消息发送与接收的sdk