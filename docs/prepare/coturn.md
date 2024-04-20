---
layout: post
title: Coturn服务安装
category: IM
description: im  muti-conference
---

本文主要说明如何在`ubuntu`和`centos`安装`coturn`服务.

## Ubuntu 安装说明

### 安装依赖库

```shell
sudo apt-get update 
sudo apt-get install libssl-dev libevent-dev libpq-dev mysql-client libmysqlclient-dev libhiredis-dev make -y
sudo apt-get install gdebi-core -y
sudo apt-get install sqlite libsqlite3-dev -y
sudo apt-get install git -y
```

### 下载源码并编译安装

```shell
git clone https://github.com/coturn/coturn
cd coturn
./configure --prefix=/usr/local/coturn
make && make install
```

### 配置文件

```conf
# 监听端口，不配置的话，默认是3478
listening-port=3478
# 内网地址,这里ubuntu设置为外网地址,不然relay使用是内网地址,导致测试无法联通
listening-ip=129.227.138.58
# 外网地址
external-ip=129.227.138.58
# 设置用户名及密码，可设置多个,自己可以修改
user=user:key
no-cli
cli-password=$5$79a316b350311570$81df9cfb9af7f5e5a76eada31e7097b663a0670f99a3c07ded3f1c8e59c5658a
```

:::note
可以将以上文件保存只`turnserver.cnf` 防止到`/etc/`目录下
:::

### 启动turnserver

```shell
root@talk02:./usr/local/coturn/bin/turnserver -v -r  外网地址:3478 -a -o -c /etc/turnserver.conf
```

* 执行成功日志

```shell
0: log file opened: /var/log/turn_13704_2020-11-12.log
0: Listener address to use: 129.227.138.58
0: 
RFC 3489/5389/5766/5780/6062/6156 STUN/TURN Server
Version Coturn-4.5.1.3 'dan Eider'
0: 
Max number of open files/sockets allowed for this process: 1048576
0: 
Due to the open files/sockets limitation,
max supported number of TURN Sessions possible is: 524000 (approximately)
0: 

==== Show him the instruments, Practical Frost: ====

0: TLS supported
0: DTLS supported
0: DTLS 1.2 supported
0: TURN/STUN ALPN supported
0: Third-party authorization (oAuth) supported
0: GCM (AEAD) supported
0: OpenSSL compile-time version: OpenSSL 1.1.1  11 Sep 2018 (0x1010100f)
0: 
0: SQLite supported, default database location is /usr/local/coturn/var/db/turndb
0: Redis supported
0: PostgreSQL supported
0: MySQL supported
0: MongoDB is not supported
0: 
0: Default Net Engine version: 3 (UDP thread per CPU core)

=====================================================

0: Domain name: 
0: Default realm: 129.227.138.58:3478
0: WARNING: cannot find certificate file: turn_server_cert.pem (1)
0: WARNING: cannot start TLS and DTLS listeners because certificate file is not set properly
0: WARNING: cannot find private key file: turn_server_pkey.pem (1)
0: WARNING: cannot start TLS and DTLS listeners because private key file is not set properly
0: Relay address to use: 129.227.138.58

```

* 验证3478端口是否监听成功

```shell
root@talk02:/usr/local/coturn/bin# netstat -nao | grep 3478

tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
tcp        0      0 129.227.138.58:3478     0.0.0.0:*               LISTEN      off (0.00/0/0)
sctp                129.227.138.58:3478                             LISTEN      
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)
udp        0      0 129.227.138.58:3478     0.0.0.0:*                           off (0.00/0/0)

```

## 安装验证

点击[WebRTC samples Trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)

![trackleice](https://media.fsharechat.cn/minio-bucket-image-name/1-qJqkqkBB-1605164184442-image.png)

:::warning
出现如上的红色标记代表成功.
:::

## 参考资料

* [centos下安装turnserver](https://www.tiocloud.com/1215956203931312128?pageNumber=1)

