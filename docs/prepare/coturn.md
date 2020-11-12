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
# 内网地址
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
./usr/local/coturn/bin/turnserver -v -r  外网地址:3478 -a -o -c /etc/turnserver.conf
```

## 参考资料

* [centos下安装turnserver](https://www.tiocloud.com/1215956203931312128?pageNumber=1)

