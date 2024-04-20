---
layout: post
title: "飞享IM集群架构与安装说明"
description: docker IM cloud native
category: IM
---

## 概述
飞享IM先已经支持集群版本部署.在说明集群版本部署之前,还是先说明以下集群的架构以方便大家能够理解部署的各个组件以及三方服务.
* 以下为飞享IM的集群架构图 

![架构图](https://media.fsharechat.cn/minio-bucket-image-name/1-373z3zNN-1605774295102-IM_Atitect.png)

## 依赖服务

从以上架构图中可以看出需要如下组件提供支持

* __数据库Mysql__
* __消息队列Kafka__
* __注册中心zookeeper__
* __对象存储minio__
* __stun/turn服务器coturn__
* __kurento媒体服务器`仅群组视频时需要`__

:::note
以上的三方组件安装,请参考`安装准备`中的说明进行安装.对于基础服务的安装这里不再赘述
:::

## 服务安装

需要安装三个服务`push-connector`,`push-group`,`push-api`这三个服务都可以水平扩展.

:::note
对于这个三个服务,会把所有服务打包成安装包提供下载,下面主要说明各个服务的配置文件
:::

### 安装包目录结构说明

:::danger
点击下载[安装包](https://media.fsharechat.cn/minio-bucket-file-name/fsharechat2.0.tar.gz)并解压到解压安装包到`/data/boot`目录,否则会出现错误
:::

```shell
├── push-api ## push-api安装目录
│   ├── config
│   │   └── application.properties  ##配置文件
│   ├── gc.log
│   ├── jvm.ini ## jvm 配置文件
│   ├── lib
│   │   └── spring-boot-web-push-api-2.0.0.jar  ## push-api jar包
│   ├── logs
│   │   └── push-api.log ## push-api日志 ./push-api start 即可启动
│   ├── push-api ## linux启动脚本
│   ├── push-api.bat  ## windows启动脚本
│   └── Readme.md
├── push-connector ## push-connector安装目录
│   ├── config
│   │   ├── application.properties  ##配置文件
│   │   ├── chat.comsince.cn.jks    ##以下两个是证书生成的jks文件,如果需要启用wss,https,需要这两个文件
│   │   └── chat.comsince.cn.trustkeystore.jks
│   ├── gc.log
│   ├── jvm.ini  ## jvm 配置文件
│   ├── lib
│   │   └── spring-boot-dubbo-push-connector-2.0.0.jar ## push-connector jar包
│   ├── logs
│   │   └── push-connector.log ## push-connector日志
│   └── push-connector ## linux启动脚本 ./push-conector start 即可启动
├── push-group
│   ├── config
│   │   └── application.properties ##配置文件
│   ├── gc.log
│   ├── jvm.ini ## jvm 配置文件
│   ├── lib
│   │   └── spring-boot-web-push-group-2.0.0.jar ## push-group jar包
│   ├── logs
│   │   └── push-group.log     ## push-group日志
│   └── push-group ## linux启动脚本 ./push-group start 即可启动
├── jdk
└── zookeeper
```


### push-connector

```yaml
# wss ssl 配置,这里配置jks需要指定其绝对路径地址,如果不启用证书,可以这里配置为空
push.ssl.keystore=
push.ssl.truststore=
push.ssl.password=
## Dubbo Registry
dubbo.registry.address=zookeeper://{zookeeper服务地址}:2181
## 绑定dubbo 本机host地址,此地址为内网地址,不同机器建能够相互访问,防止dubbo无法绑定服务地址,导致不同机器无法访问服务,push-group与push-connector部署在不同机器时最好设置
#dubbo.protocol.host=172.16.0.2

## kafka broker 
push.kafka.broker={kafka集群地址}:9092

## 当前服务的id,从0开始,最大为63,可同时部署64台
node.id=0

## kurento client url
kurento.clientUrl=ws://media.fsharechat.cn:8888/kurento

## minio服务配置
## minio url 修改为你自己的minio服务地址
minio.url=https://media.fsharechat.cn
## minio access_key 这里是启动的时候设置的access_key
minio.access_key=
## minio secret_key 这里是启动的时候设置的secret_key
minio.secret_key=

```

### push-group

```yaml

## Dubbo 注册中心
dubbo.registry.address=zookeeper://{zookeeper地址}:2181
## 绑定dubbo 本机host地址,防止dubbo无法绑定服务地址,导致不同机器无法访问服务,push-group与push-connector部署在不同机器时最好设置
#dubbo.protocol.host=172.16.0.2

## hazel集群成员配置,这里填push-group不同机器的内网ip地址,不同ip逗号分割
hazelcast.members=172.16.176.23

#云短信厂商,0:代表不启用短信通道 1:代表阿里云短信 2: 代表腾讯云短信
sms.cp=0
# 应用id
sms.appid=LTAI4Ff1jtqrSr3rkHMKEnfs
# 应用key
sms.appkey=gG33mvmMAxGYol7Vd1AEG6InRK9VCD
# 模板id
sms.templateId=SMS_180355435
# 短信签名由于编码问题,请到相应的代码里面设置

# 短信超级验证码,正式上线请修改
sms.superCode=66666

# 是否使用内置数据库 1: 表示使用 0: 使用mySql
im.embed_db=0
# jdbc url
im.jdbc_url=jdbc:mysql://{数据库地址}:3306/fsharechat?useSSL=false&serverTimezone=GMT&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=utf8
# mysql数据库访问用户名
im.user=root
#mysql数据库访问密码
im.password=123456

```

### push-api

```yaml
# Spring boot application
spring.application.name=spring-boot-web-push-api
spring.main.allow-bean-definition-overriding=true
## Dubbo Registry
dubbo.registry.address=zookeeper://{zookeeper地址}:2181

## http port
server.port=8081
```


:::warning
请请确认好三方组件都已经准备好,并且配置文件都已经配置成功后,依次`push-group`,`push-connector`,`push-api`逐一启动各个服务.之后每台服务器都是同样的启动方法
:::