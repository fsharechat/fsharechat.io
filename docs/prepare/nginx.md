---
layout: wiki
title: Nginx安装配置说明
---

这里主要说明nginx部署飞享IM Web版本的nginx配置,同时说明配置nginx支持https.以支持`minio`实现https访问

## Nginx安装

* [nginx安装](https://comsince.cn/wiki/2018-12-29-webserver-nginx/)

## Nginx配置Https说明

```shell
server {
        listen       443 ssl;
        server_name  localhost;

        ssl_certificate      /etc/letsencrypt/live/comsince.cn/fullchain.pem;
        ssl_certificate_key  /etc/letsencrypt/live/comsince.cn/privkey.pem;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ##飞享web版本
        location /web {
               root   /data/boot/;
               index  index.html index.htm;
        }

        ##飞享web移动版本
        location /mobile {
               root   /data/boot/;
               index  index.html index.htm;
        }
  
        ##minio对象存
        location /minio {
            proxy_pass  http://localhost:9000;
        }

        ##手机验证码登录
        location /login {
            proxy_pass http://localhost:8081;
        }
        ## 发送验证码
        location /send_code {
            proxy_pass http://localhost:8081;
        }

        ##配置minio上传url,支持最大500M文件上传
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
```