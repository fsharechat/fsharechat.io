---
layout: wiki
title: MySQL基本安装
---

本文主要说明mysql在个平台的安装说明

##  CentOS 6.5/6.6 安装（install）mysql 5.7 最完整版教程

### Step1: 检测系统是否自带安装mysql

```
# yum list installed | grep mysql
```

### Step2: 删除系统自带的mysql及其依赖
命令：
```
# yum -y remove mysql-libs.x86_64
```

### Step3: 给CentOS添加rpm源，并且选择较新的源
命令：
```
# wget dev.mysql.com/get/mysql-community-release-el6-5.noarch.rpm
# yum localinstall mysql-community-release-el6-5.noarch.rpm
# yum repolist all | grep mysql
# yum-config-manager --disable mysql55-community
# yum-config-manager --disable mysql56-community
# yum-config-manager --enable mysql57-community-dmr
# yum repolist enabled | grep mysql
```

**NOTE:**这里可以查看要安装的mysql版本，可以启动禁用选择的版本

### Step4:安装mysql 服务器
命令：
```
# yum install mysql-community-server
```

Step5: 启动mysql
命令:
```
# service mysqld start
```

### Step6: 查看mysql是否自启动,并且设置开启自启动
命令:
```
# chkconfig --list | grep mysqld
# chkconfig mysqld on
```

### Step7: mysql安全设置
命令：
```
# mysql_secure_installation
```

**NOTE:** 这里提供对话式的选择配置设置，也可以使用如下命令更改root用户密码 `mysqladmin -u root password 'root'`


## Myql备份与恢复

### 备份

```shell
mysqldump -uroot -p wfchat > wfchat.sql
```

### 恢复

```shell
mysql -uroot -p db_name < backfile
```

## Unbuntu 18.04

### Prerequisites
To follow this tutorial, you will need:

One Ubuntu 18.04 server set up by following this initial server setup guide, including a non-root user with sudo privileges and a firewall.
Step 1 — Installing MySQL
On Ubuntu 18.04, only the latest version of MySQL is included in the APT package repository by default. At the time of writing, that’s MySQL 5.7

To install it, update the package index on your server with apt:
```shell
sudo apt update
```

Then install the default package:
```shell
sudo apt install mysql-server
```
This will install MySQL, but will not prompt you to set a password or make any other configuration changes. Because this leaves your installation of MySQL insecure, we will address this next.

### Step 2 — Configuring MySQL

```shell
sudo mysql_secure_installation
```

### 授权访问

**NOTE:** root 无法登录时修改密码的解决方案

我们通过apt-get 命令安装的MySQL，默认的登录名和登录密码是保存在 /etc/mysql/debian.cnf 下的

```shell
sudo cat /etc/mysql/debian.cnf
```

* 使用 `debian-sys-maint`登录mysql
* 修改`root`帐号密码

```shell
 use mysql
 update user set authentication_string=password(' 你的密码 ') where user='root' and host='localhost' 
 update user set plugin="mysql_native_password"
 flush privileges
 # 重启mysql
 sudo service mysql restart
```

* Check the authentication methods employed by each of your users again to confirm that root no longer authenticates using the auth_socket plugin:

```shell
mysql> SELECT user,authentication_string,plugin,host FROM mysql.user;

+------------------+-------------------------------------------+-----------------------+-----------+
| user             | authentication_string                     | plugin                | host      |
+------------------+-------------------------------------------+-----------------------+-----------+
| root             | *3636DACC8616D997782ADD0839F92C1571D6D78F | mysql_native_password | localhost |
| mysql.session    | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE | mysql_native_password | localhost |
| mysql.sys        | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE | mysql_native_password | localhost |
| debian-sys-maint | *CC744277A401A7D25BE1CA89AFF17BF607F876FF | mysql_native_password | localhost |
+------------------+-------------------------------------------+-----------------------+-----------+
4 rows in set (0.00 sec)

```

**NOTE:** 确认root 帐号plugin 使用的是`mysql_native_password`,不然root帐号无法使用密码链接mysql, 如果不是可以如下修改

```shell
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
```


## 参考资料
* [CentOS 6.5/6.6 安装（install）mysql 5.7 最完整版教程](https://segmentfault.com/a/1190000003049498)
* [MySQL 备份和恢复机制](https://juejin.im/entry/5a0aa2026fb9a045132a369f)
* [How To Install MySQL on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04)
* [Ubuntu 18.04 系统下MySQL首次安装用root登录不了，修改root初始密码，解决办法](https://blog.csdn.net/verylonglongago/article/details/85479704)
