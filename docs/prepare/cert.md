---
layout: wiki
title: 证书配置说明
---

由于音视频使用webrtc,而chrome仅仅需要支持https的网站使用webRTC.因为web端需要支持https.本文主要说明如何利用证书文件生成`jks`.

## 免费泛域名域名证书申请

:::note
以下使用unbutu18.04进行申请
:::

### 安装Certbot

* 添加软件源

```shell
apt install software-properties-common -y && add-apt-repository ppa:certbot/certbot -y
```

* 安装 Certbot

```shell
apt update && apt install python-certbot-nginx -y
```

### 签发泛域名证书

```shell
certbot certonly \
--email i@timelate.com \
--agree-tos \
--preferred-challenges dns \
--server https://acme-v02.api.letsencrypt.org/directory \
--manual \
-d lattecloud.cc \
-d *.lattecloud.cc
```

:::note
注意，以上命令需要全部复制，在终端中一起执行
:::

* `certonly` ，获取或更新证书，但是不安装到本机
* `--email` ，接收有关账户的重要通知的邮箱地址，非必要，建议最好带上
* `--agree-tos` ，同意 ACME 服务器的订阅协议
* `--preferred-challenges dns` ，以 DNS Plugins 的方式进行验证
* `--server https://acme-v02.api.letsencrypt.org/directory` ，指定验证服务器地址为 acme-v02 的，因为默认的服务器地址是 acme-v01 的，不支持通配符验证
* `--manual` ，采用手动交互式的方式验证
* `--d lattecloud.cc` ，指定要验证的域名。注意，不带 www 的一级域名 lattecloud.cc和通配符二级域名 *.lattecloud.cc 都要写，如果只写 *.lattecloud.cc ，生成的证书是无法识别 lattecloud.cc 的

命令执行后终端返回信息如下，询问是否同意记录申请证书服务器的 IP ，输入 `Y` ，回车

```shell
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Obtaining a new certificate
Performing the following challenges:
dns-01 challenge for lattecloud.cc
dns-01 challenge for lattecloud.cc

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: Y
```

回车后终端中返回信息如下，要求创建一条 TXT 记录，以验证域名归属。在域名服务商处添加相应的 TXT 记录，并验证是否解析成功。可以在另一个 SSH 窗口中执行 `dig -t txt _acme-challenge.lattecloud.cc @8.8.8.8` 命令查看域名解析情况，如果 ANSWER SECTION 中有 _acme-challenge.lattecloud.cc. 299 IN TXT "73kvVAMvFGenzJE_spiVbDV2Ivpz3tGnDJT8UObQxdE" ，说明解析生效。解析生效后回车，进行下一步：

```shell
Please deploy a DNS TXT record under the name
_acme-challenge.lattecloud.cc with the following value:

73kvVAMvFGenzJE_spiVbDV2Ivpz3tGnDJT8UObQxdE

Before continuing, verify the record is deployed.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue
```

回车后终端返回信息如下，要求再添加一条 TXT 记录。因为我们实际要为 `lattecloud.cc` 和 `*.lattecloud.cc` 两个域名签发证书，因此需要添加两条 TXT 记录。添加完记录后验证是否生效，生效后回车进行域名验证和证书签发。注意，添加此条 TXT 记录时不要修改、删除之前的 TXT 记录，两条记录都要保持生效状态：

```shell
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/lattecloud.cc/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/lattecloud.cc/privkey.pem
   Your cert will expire on 2020-05-24. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

> 签发的泛域名证书有效期为三个月，证书到期前需要续签证书。证书路径如下

```shell
certificate： /etc/letsencrypt/live/lattecloud.cc/fullchain.pem
key：         /etc/letsencrypt/live/lattecloud.cc/privkey.pem
```

## 申请证书

:::note
这里采用的是开源项目进行申请,避免操作dns.注意`au.sh`要填写绝对路径
:::

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<Tabs defaultValue="cert-apply" values={[
  { label: "cert-apply", value: "cert-apply" },
  { label: "cert-apply-result", value: "cert-apply-result" },
]}>

<TabItem value="cert-apply">

```shell
certbot certonly  -d *.fsharechat.cn --manual --preferred-challenges dns --manual-auth-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly add" --manual-cleanup-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly clean"
```

</TabItem>

<TabItem value="cert-apply-result">

```shell
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Obtaining a new certificate
Performing the following challenges:
dns-01 challenge for fsharechat.cn

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/fsharechat.cn/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/fsharechat.cn/privkey.pem
   Your cert will expire on 2021-01-21. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

</TabItem>

</Tabs>

## 域名续期

### 校验续期

```shell
certbot-auto renew
```
### 脚本续期

:::note
这里采用一个开源项目提供的脚本续期,避免手动添加dns解析,具体配置参见[certbot-letencrypt-wildcardcertificates-alydns-au](https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au)
:::

### Dry-Run

<Tabs defaultValue="dry-run" values={[
  { label: "dry-run", value: "dry-run" },
  { label: "dry-run-result", value: "dry-run-result" },
]}>

<TabItem value="dry-run">

```shell
certbot certonly  -d *.comsince.cn --manual --preferred-challenges dns --dry-run  --manual-auth-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly add" --manual-cleanup-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly clean"

### 通配符证书为 *.example.com，对example.com无效，你需要通过Certbot的Certbot的-d标志来同时添加它们 ，例如：

certbot certonly  -d *.fsharechat.cn -d fsharechat.cn --manual --preferred-challenges dns --manual-auth-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly add" --manual-cleanup-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly clean"
```

</TabItem>

<TabItem value="dry-run-result">

```shell
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Obtaining a new certificate
Performing the following challenges:
dns-01 challenge for comsince.cn

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - The dry run was successful.
```

</TabItem>

</Tabs>


### 正式续期

<Tabs defaultValue="renew" values={[
  { label: "renew", value: "renew" },
  { label: "renew-result", value: "renew-result" },
]}>

<TabItem value="renew">

```shell
certbot renew --cert-name comsince.cn  --manual-auth-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly add" --manual-cleanup-hook "/data/certbot/certbot-letencrypt-wildcardcertificates-alydns-au/au.sh python aly clean"
```

</TabItem>

<TabItem value="renew-result">

```shell
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/comsince.cn.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Cert is due for renewal, auto-renewing...
Plugins selected: Authenticator manual, Installer None
Renewing an existing certificate
Performing the following challenges:
dns-01 challenge for comsince.cn
Waiting for verification...
Cleaning up challenges

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
new certificate deployed without reload, fullchain is
/etc/letsencrypt/live/comsince.cn/fullchain.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Congratulations, all renewals succeeded. The following certs have been renewed:
  /etc/letsencrypt/live/comsince.cn/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

</TabItem>

</Tabs>

## 生成JKS

:::warning
服务端证书更新 当刷新了证书,服务端Jks也需要更新,使用`KeyManager`,使用格式转换工具,导入fullchain.pem,private.key即可
:::

### KeyManager通过Cert生成jks

![image](https://media.comsince.cn/minio-bucket-image-name/keymanager-pem-setting.png)

* keytool 显示jks详细信息

```shell
keytool -list -keystore comsince.cn.jks 
输入密钥库口令:  

密钥库类型: JKS
密钥库提供方: SUN

您的密钥库包含 1 个条目

1, 2020-7-31, PrivateKeyEntry, 
证书指纹 (SHA1): 02:72:5F:EB:86:D7:42:2B:58:5B:D9:F3:05:F3:E5:17:45:15:D6:A5

```

* 生成truststore.jks

```shell
keytool -import -alias certificatekey -file {公钥证书}  -keystore comsince.cn.trustkeystore.jks
```

:::note
公钥证书即为certbot生成的路径如下: /etc/letsencrypt/live/comsince.cn/cert.pem
:::

## 参考文档

* [Ubuntu 18.04 使用 Certbot 申请并安装 Let's Encrypt 泛域名证书](https://www.timelate.com/archives/use-certbot-to-apply-and-install-letsencrypt-pan-domain-certificate.html)