---
layout: post
title: "关于我们"
description: 关于飞享IM(FshareIM)开源项目
category: consult
---

飞享IM（FshareIM）是一个技术自主可控的即时通讯（IM）系统开源项目，目标是为企业与个人开发者提供一套可私有化部署、可二次开发的 IM 基础设施，涵盖单聊、群聊、音视频通话、消息多端同步等核心能力。

## 技术架构

* 服务端基于 SpringBoot 微服务架构，网络层使用 tio，服务间调用采用 Dubbo RPC
* Web 端基于 Vue，桌面客户端基于 Electron 实现跨平台
* 音视频通话基于 WebRTC 自主实现
* 支持对象存储 MinIO、Docker / Kubernetes 一键部署

更完整的架构说明见[系统架构文档](/docs/introduction/)。

## 本站说明

本站（fsharechat.cn）是飞享IM项目的官方文档与信息发布站点，用于发布产品介绍、部署文档、技术博客及客户端下载入口。本站由项目维护者个人 / 开源社区维护，非商业公司实体运营站点。

如果你使用飞享IM的开源代码自行部署（私有化部署），该部署实例的运行、数据存储与合规责任由部署方自行承担，与本站无关。

## 联系我们

商业合作、技术支持等事宜，请见[联系我们](/docs/consult/contact/)页面。
