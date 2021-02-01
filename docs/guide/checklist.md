---
layout: post
title: "服务检查配置清单与服务启动项"
description: docker IM checklist native
category: IM
---

## 音视频相关
### coturn启动

* coturn

```properties
# 监听端口，不配置的话，默认是3478
listening-port=3478
# 内网地址,这里ubuntu设置为外网地址,不然relay使用是内网地址,导致测试无法联通
listening-ip=169.254.30.2
# 外网地址
external-ip=169.254.30.2
# 设置用户名及密码，可设置多个,自己可以修改
user=test:test
no-cli
cli-password=$5$79a316b350311570$81df9cfb9af7f5e5a76eada31e7097b663a0670f99a3c07ded3f1c8e59c5658a	

```

:::note
此文件放置于/etc/turnserver.conf
:::

* 启动命令

```shell
/usr/local/coturn/bin/turnserver -v -r  169.254.30.2:3478 -a -o -c /etc/turnserver.conf
```

### kurento

* 配置

:::note
如果media server有外部地址,可以不用配置turn/stun server地址,修改`/etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini`
externalAddress=10.20.30.40
:::

* 启动与停止

```shell
sudo service kurento-media-server start
sudo service kurento-media-server stop
```

## 对象存储Minio

* 启动脚本

```shell
MINIO_ACCESS_KEY={access_key} MINIO_SECRET_KEY={secret_key} nohup ./data/minio/minio  server  /data/minio/miniodata/  > /data/minio/minio.log 2>&1 &
```

## Nginx

:::note
Nginx主要配置支持https,wss,复制所有http的服务转发,包括minio,nginx 一般是随开机启动
:::

* 配置项目

```
server {
        listen       443 ssl;
        server_name  localhost;

        ssl_certificate      /data/ssl/ssl-fsharechat.crt; ## 这里可以使用自签名证书
        ssl_certificate_key  /data/ssl/ssl-fsharechat.key;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ##飞享web版本
        location / {
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               root   /data/boot/web/dist;
               index  index.html index.htm;
        }

        ##飞享web移动版本
        location /mobile {
               root   /data/boot/;
               index  index.html index.htm;
        }

        location /admin {
            alias   /data/boot/admin;
                try_files $uri $uri/ /index.html =404;
            index  index.html index.htm;
        }

        location /prod-api/{
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header REMOTE-HOST $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass http://localhost:8080/;
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

        location /imopenapi {
            proxy_pass http://localhost:8081;
        }


        ##支持wss配置
        location /ws {
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header Host $host;
           proxy_pass http://ws-backend;
            

           # proxy_ssl_certificate     /etc/letsencrypt/live/comsince.cn/fullchain.pem;
           # proxy_ssl_certificate_key /etc/letsencrypt/live/comsince.cn/privkey.pem;
 
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
        }
}


upstream ws-backend {
      server 127.0.0.1:9326;
} 



server {
	    listen 80;
	    server_name chat.comsince.cn;  ## 这里修改为自己的域名
            #rewrite ^ https://$host$request_uri? permanent;
            #rewrite ^(.*)$ https://$host$1 permanent;
            if ($scheme != "https") {
                return 301 https://$host$request_uri;
            }            

       	    if ($host = chat.comsince.cn) {
               return 301 https://$host$request_uri;
            }

            #return 404;
      	    root   html;
	    index  index.html index.htm index.php;
	    
	}

```


:::note
建议将此配置单独防止在`/etc/nginx/conf.d/fsharechat.conf`中
:::

### 自签名证书配置

* 生成证书

```shell
openssl req \
-newkey rsa:2048 \
-x509 \
-nodes \
-keyout ssl-fsharechat.key \
-new \
-out ssl-fsharechat.crt \
-subj /CN=Hostname \
-reqexts SAN \
-extensions SAN \
-config <(cat /etc/ssl/openssl.cnf \
    <(printf '[SAN]\nsubjectAltName=DNS:hostname,IP:{你的机器ip地址}')) \
-sha256 \
-days 3650
```

* 解决内网证书java客户端调用失败的问题解决 java 使用ssl过程中出现"PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderExcep

**NOTE:** 解决方式为将自签名证书添加到java的证书列表中,防止出现以上报错

```
## 进入jdk jre的bin目录执行keytool命令
cd /data/jdk/jre/bin
keytool -import -alias cacerts -keystore cacerts -file /data/ssl/ssl-fsharechat.crt
## 此时命令行会提示你输入cacerts证书库的密码
## 敲入changeit，这是java中cacerts证书库的默认密码
```

## 服务配置检查与启动

* 启动服务

```shell
/data/boot/push-group/push-group start
/data/boot/push-connector/push-connector start
/data/boot/push-api/push-api start
```

**NOTE:** 各个服务的配置请到相应的`config/application.properties`下修改