---
layout: wiki
title: Minio基本安装说明
---

本文主要说明对象存储服务的安装以及相关配置,以支持IM的对象功能,方便私有化部署

## 安装

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<Tabs defaultValue="linux" values={[
  { label: "Linux", value: "linux" },
  { label: "Windows", value: "windows" },
]}>

<TabItem value="linux">

```shell
wget http://dl.minio.org.cn/server/minio/release/linux-amd64/minio
chmod +x minio
```

</TabItem>

<TabItem value="windows">

```shell
```

</TabItem>

</Tabs>

## 启动minio服务

### linux启动

* 前台启动

```shell
./minio server data/
```

* 后台启动

```shell
nohup ./minio server miniodata/ >/data/minio.log 2>&1 &
```

* 修改参数启动

```shell
MINIO_ACCESS_KEY=test MINIO_SECRET_KEY=test nohup ./minio  server  miniodata/  > /opt/minio/minio.log 2>&1 &
```
## 启动https

```shell
MINIO_ACCESS_KEY=test MINIO_SECRET_KEY=test nohup ./minio  server --address ":443" /data/miniodata/  > /data/minio.log 2>&1 &
```

:::note
关于使用nginx代码minio的https的方式请[参考](nginx)
minio 重置密钥请删除/miniodata/目录下的`.minio.sys` 文件,然后重启,注意重启以后,要重新设置安全策略
:::

## minio配置

### 创建bucket

在minio的管理控制台中,手动创建如下bucket

![create-minio-bucket](https://media.fsharechat.cn/minio-bucket-image-name/1-TWTVTVWW-1603353071527-image.png)

* `minio-bucket-general-name`
* `minio-bucket-image-name`
* `minio-bucket-voice-name`
* `minio-bucket-video-name`
* `minio-bucket-file-name`
* `minio-bucket-portrait-name`
* `minio-bucket-favorite-name`

### 配置访问策略

MinIO 默认的策略是分享地址的有效时间最多是7天，要突破这种限制，可以在 bucket 中进行策略设置。点击对应的 bucket ，edit policy 添加策略 `*.*`

![minio-policy](https://media.fsharechat.cn/minio-bucket-image-name/1-TWTVTVWW-1603352581183-image.png)

:::note
 另外上传的文件必须带文件后缀,不然无法下载
:::



## 参考资料
* [MinIO Quickstart Guide](http://docs.minio.org.cn/docs/)
* [为MinIO Server设置Nginx代理](http://docs.minio.org.cn/docs/master/setup-nginx-proxy-with-minio)
