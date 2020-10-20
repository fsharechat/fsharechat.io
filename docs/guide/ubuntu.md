---
layout: post
title: "Ubuntu上单机部署实践"
description: docker IM cloud native
category: IM
---

此文档主要说明在ubuntu单击部署飞享的基本步骤与注意事项,重点说明可能出错的地方与解决方案

# Nginx 安装

## 1. apt安装
```shell
sudo apt install nginx
```

## 2. 文件位置
```shell
/usr/sbin/nginx    :主程序
/etc/nginx         :配置文件
/usr/share/nginx   :存放静态文件
/var/log/nginx     :存放日志
```

## 3. 启动nginx

```shell
service nginx start # 启动nginx
service nginx reload # 重新加载nginx配置文件
```

## 4. nginx命令

```shell
nginx -s reopen # 重启nginx
nginx -s stop # 停止nginx
nginx -v # 查看版本号
```

# Minio安装

## 本地化安装

```
wget http://dl.minio.org.cn/server/minio/release/linux-amd64/minio
chmod +x minio
## 前台启动
./minio server data/
## 后台启动
nohup ./minio server miniodata/ >/data/minio.log 2>&1 &
## 修改参数启动 目前不启用https,所有的都经过nginx转发
MINIO_ACCESS_KEY=test MINIO_SECRET_KEY=test123456 nohup ./minio  server  miniodata/  > /opt/minio/minio.log 2>&1 &
## 启动https 注意accesskey 和secretkey 保持不变
MINIO_ACCESS_KEY=test MINIO_SECRET_KEY=test nohup ./minio  server --address ":443" /data/miniodata/  > /data/minio.log 2>&1 &
```

# IM 服务安装

**NOTE:** 参见[服务安装说明](https://github.com/fsharechat/chat-server-release)

## base脚本启动问题

**NOTE:** 注意修改声明`#!/bin/sh`

## JKS 配置

## 数据库问题

### 数据库链接serverzone问题
```yaml
set global time_zone='+8:00';
```

### 数据库版本问题

```java
SQL State  : 42000
Error Code : 1067
Message    : Invalid default value for '_dt'
Location   : migrate/mysql/V2__create_table.sql (/data/boot/push-group/file:/data/boot/push-group/lib/spring-boot-web-push-group-1.2.1.jar!/BOOT-INF/classes!/migrate/mysql/V2__create_table.sql)
Line       : 21

```

**NOTE:** 需要5.6.5之后版本才支持

# Nginx 服务配置

```properties
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
  worker_connections 768;
  # multi_accept on;
}

http {

  upstream blog  {
      server 129.227.138.58:4000;
  }

  server {
      listen 80;
      server_name comsince.cn  www.comsince.cn;
      #rewrite ^ https://$host$request_uri? permanent;
      #rewrite ^(.*)$ https://$host$1 permanent;
      if ($scheme != "https") {
          return 301 https://$host$request_uri;
      }            

      if ($host = www.comsince.cn) {
         return 301 https://$host$request_uri;
      }

      if ($host = comsince.cn) {
         return 301 https://$host$request_uri;
      }

      if ($host = media.comsince.cn) {
         return 301 https://$host$request_uri;
      }

      #return 404;
      root   html;
      index  index.html index.htm index.php;
      
  }

  server {
        listen       443 ssl;
        server_name  localhost;

        ssl_certificate      /etc/letsencrypt/live/comsince.cn/fullchain.pem;
        ssl_certificate_key  /etc/letsencrypt/live/comsince.cn/privkey.pem;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        location /web {
               root   /data/boot/;
               index  index.html index.htm;
        }

        location /mobile {
               root   /data/boot/;
               index  index.html index.htm;
        }
  

        location /minio {
            proxy_pass  http://localhost:9000;
        }

        location /login {
            proxy_pass http://localhost:8081;
        }
        
        location /send_code {
            proxy_pass http://localhost:8081;
        }


        location ~* /minio-bucket* {
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
          proxy_set_header Host $http_host;
          client_max_body_size  500m;
          proxy_connect_timeout 300;
          # Default is HTTP/1, keepalive is only enabled in HTTP/1.1
          proxy_http_version 1.1;
          proxy_set_header Connection "";
          chunked_transfer_encoding off;
          proxy_pass  http://localhost:9000;
        }

    }

  ##
  # Basic Settings
  ##

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  # server_tokens off;

  # server_names_hash_bucket_size 64;
  # server_name_in_redirect off;

  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  ##
  # SSL Settings
  ##

  ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
  ssl_prefer_server_ciphers on;

  ##
  # Logging Settings
  ##

  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;

  ##
  # Gzip Settings
  ##

  gzip on;

  # gzip_vary on;
  # gzip_proxied any;
  # gzip_comp_level 6;
  # gzip_buffers 16 8k;
  # gzip_http_version 1.1;
  # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  ##
  # Virtual Host Configs
  ##

  include /etc/nginx/conf.d/*.conf;
  include /etc/nginx/sites-enabled/*;
}


#mail {
# # See sample authentication script at:
# # http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
# 
# # auth_http localhost/auth.php;
# # pop3_capabilities "TOP" "USER";
# # imap_capabilities "IMAP4rev1" "UIDPLUS";
# 
# server {
#   listen     localhost:110;
#   protocol   pop3;
#   proxy      on;
# }
# 
# server {
#   listen     localhost:143;
#   protocol   imap;
#   proxy      on;
# }
#}

```