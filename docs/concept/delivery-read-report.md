---
layout: post
title: "送达与已读回执的设计方案说明"
description: docker IM cloud native
category: IM
---


本文主要说明送达与阅读回执的实现方案,并给出具体的设计,仅供参考

## 设计要点

* 送达回执只上报单聊,群聊消息不上报送达回执
* 送达只在单聊界面中显示,群聊不关心送达.那么根据`uid`和`target`就能确定当前用户的单聊界面最后一次消息的送达时间
* 单聊已读回执,同送达回执原理一样


* 群聊没有送达回执,只统计已读回执.
  * 上报时机.当用户进行会话切换
  * 如果用户读取了改群组的最后一条消息,代表这个用户读取所有其他用户发送的消息.即是任意发送消息给该群组的用户可以通过`uid`和`target`来确定该uid用户是否读取了消息
  * 对于群组消息的已读回执上报,要上报当前群组会话中,发送消息的用户ID

## 送达回执

* 送达  
代表接收到对方发送的消息,这里指拉取到最新的用户消息的时间点

每个用户上报自己最后一次接收消息的时间



> 以下为送达回执sql

```sql
DROP TABLE IF EXISTS `t_delivery_report`;
CREATE TABLE `t_delivery_report` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `_uid` varchar(64) NOT NULL,
  `_target` varchar(64) NOT NULL,
  `_rid` bigint(20) NOT NULL,
  `_dt` bigint(20) NOT NULL,
  UNIQUE INDEX `delivery_index` (`_uid` DESC, `_target` DESC )
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;
```

* 获取送达回执

```sql
DROP TABLE IF EXISTS `t_user_delivery_report`;
CREATE TABLE `t_user_delivery_report` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `_rid` bigint(20) NOT NULL,
  `_uid` varchar(64) NOT NULL,
  `_seq` bigint(20) NOT NULL,
  `_dt` DATETIME NOT NULL DEFAULT NOW(),
  INDEX `user_delivery_index` (`_uid` DESC, `_seq` DESC),
  UNIQUE INDEX `user_delivery_index2` (`_uid` DESC, `_rid` DESC)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

```

送达回执持久化存储,采用即时推送机制,用户发送送达回执后,推送给发送者当前送达回执seq,发送者根据seq获取最新的送达回执列表.
原理同发送消息的推拉模式

## 已读回执

* 已读  
已读跟已送达有点区别,送达代表用户已经拉取到对方发来的消息,在收到消息后,上报此时收到新消息的最新时间,这个时间点.就是该用户的接收消息时间点.
由于消息在每个会话中,每个会话都有阅读时间点.用户没有点击这个会话代表用户没有阅读该会话内的消息.如果只上报一条已读消息,无法区分用户到底阅读的是那个会话里面的消息

> 已读回执存储

```sql
DROP TABLE IF EXISTS `t_read_report`;
CREATE TABLE `t_read_report` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `_uid` varchar(64) NULL,
  `_rid` bigint(20) NOT NULL,
  `_type` tinyint NULL,
  `_line` int(11) NULL,
  `_target` varchar(64) NULL,
  `_dt` bigint(20) NOT NULL DEFAULT 0,
  INDEX `read_report_index` (`_uid`, `_type`, `_line`, `_target`),
  UNIQUE INDEX `read_report_index2` (`_uid` DESC, `_target` DESC )
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;
```

* 获取已读回执

```sql
DROP TABLE IF EXISTS `t_user_read_report`;
CREATE TABLE `t_user_read_report` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `_rid` bigint(20) NOT NULL,
    `_uid` varchar(64) NOT NULL,
    `_seq` bigint(20) NOT NULL,
    `_dt` DATETIME NOT NULL DEFAULT NOW(),
    INDEX `user_read_report_index` (`_uid` DESC, `_seq` DESC),
    UNIQUE INDEX `user_read_report_index2` (`_uid` DESC, `_rid` DESC)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;
```

## 参考资料

* [已送达和已读回执功能说明](https://docs.wildfirechat.cn/blogs/%E5%B7%B2%E9%80%81%E8%BE%BE%E5%92%8C%E5%B7%B2%E8%AF%BB%E5%9B%9E%E6%89%A7%E5%8A%9F%E8%83%BD%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.html)