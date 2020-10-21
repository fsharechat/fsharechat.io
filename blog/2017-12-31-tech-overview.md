---
title: "IT软件知识-技能图谱"
description: Linux 基础技能
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.comsince.cn/minio-bucket-portrait-name/fsharechat.png
---

<img
  alt="fendou"
  className="banner"
  src="https://media.comsince.cn/minio-bucket-file-name/it.jpeg"
/>

主要说明不断更新的软件技术指引未来发展方向，此文持续更新。对于技术的共性给出必要的原理解释。
linux的基本技能，主要说明linux环境下c编程，shell；着重于基础概念，并不是作为进阶的工具，主要起到一个抛砖抛砖引玉的作用，能够通过对这些基本的技能的学习初步掌握解决问题的基本技能。此文章并不深入讨论各个技术点的细节，只是总结出技能之间的依赖关系，归纳出一般的学习步骤，希望对自己的思路有一个清晰的认识。

<!--truncate-->

## Linux 基础

* [鸟哥的私房菜PDF](https://www.comsince.cn/static/download/linux-introduction.pdf)

## linux C 编程基础
  c 语言编程的基本语法这里不再赘述，基本大同小异，这里主要研究，在工程的条件下，如果快速的编译c代码，像一些面向对象的编程语言都有提供相应的工具入maven，gradle；c也有自己独特的方式。
 * [Linux C编程一站式学习](https://akaedu.github.io/book/index.html)
 * [Awesome-C](https://github.com/aleksandar-todorovic/awesome-c)
 

## C/C++ 基础

* [Learn c](https://www.tutorialspoint.com/cprogramming/index.htm)
* [Learn c++](https://www.tutorialspoint.com/cplusplus/index.htm)

### 指针

对星号`*`的总结
在我们目前所学到的语法中，星号*主要有三种用途：
* 表示乘法，例如`int a = 3, b = 5, c;  c = a * b;`123456
，这是最容易理解的。
* 表示定义一个指针变量，以和普通变量区分开，例如`int a = 100;  int *p = &a;`。
* 表示获取指针指向的数据，是一种间接操作，例如`int a, b, *p = &a;  *p = 100;  b = *p;`。
* 参考：
   * [大话C 语言指针](http://c.biancheng.net/cpp/html/72.html)

* [char* const args[] defintion [duplicate]](https://stackoverflow.com/questions/15576291/char-const-args-defintion)

以下说明c编译的相关知识
   由于c没有import自动关联编译的，需要[Header File](https://gcc.gnu.org/onlinedocs/cpp/Header-Files.html)进行类型声明，接口暴露

* [The C Preprocessor](https://gcc.gnu.org/onlinedocs/cpp/index.html#Top)

### 宏定义

* [GCC-Macros](https://gcc.gnu.org/onlinedocs/cpp/Macros.html#Macros)
* [GCC-HEADER-FILES](https://gcc.gnu.org/onlinedocs/cpp/Header-Files.html)

### Makefile
C没有像gradle和maven的编译工具，需要使用makefile来组织编译，不过以后可以使用CMake

* [GNU make](https://www.gnu.org/software/make/manual/make.html)
* [GNU Make 译文](https://www.comsince.cn/static/download/gun_make.pdf)
* [跟我一起写Makefile](http://wiki.ubuntu.org.cn/%E8%B7%9F%E6%88%91%E4%B8%80%E8%B5%B7%E5%86%99Makefile)

### CMake

提供跨平台的编译工具，makefile自动生成，只需用cmake配置规则

* [CMake 入门实战](http://www.hahack.com/codes/cmake/)

## Shell

* [Linux online manpage](http://man7.org/linux/man-pages/)
* [Shell编程基础](http://wiki.ubuntu.org.cn/Shell%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80)



之前我在ubuntu上跑代码时，当运行一个shell脚本的时候,出现了如下错误
../runcmake: 行 2: $'\r': 未找到命令
../runcmake: 行 3: 未预期的符号 `$'{\r'' 附近有语法错误

考虑到代码是从windows下一直过来的，脚本可能在格式上存在问题

* 解决方案：
```
   sudo apt-get install dos2unix

   dos2unix  **.sh
```

## Android NDK

### NDK Build Problem

* 问题

```
Android NDK: Your APP_BUILD_SCRIPT points to an unknown file:
```

* 解决办法

如果是一个android工程的话，执行如下命令：
```
ndk-build NDK_PROJECT_PATH=./main/cpp  NDK_LOG=1
```
如果设置NDK工程目录，ndk默认会从该目录起寻找该目录下jni目录，如果没有找到就报如下错误：
```
Your APP_BUILD_SCRIPT points to an unknown file: ./main/cpp/jni/Android.mk    
```
这是你可以指定android.mk的路径,如下`APP_BUILD_SCRIPT=./main/cpp/Android.mk`

## 参考资料

* [宏的基本概念](http://www.geeksforgeeks.org/interesting-facts-preprocessors-c/)

### 集成开发工具

* [What is the best C & C++ IDE?](https://www.quora.com/What-is-the-best-C-C++-IDE)
* [Clion License Server](http://www.sdbeta.com/mf/2017/0414/177253.html)
  弹出注册窗口选择Activate》License Server》输入`http://xidea.online`，然后点击`Activete`完成认证即可

### C/C++ Library

* [awesome-cpp](https://github.com/fffaraz/awesome-cpp)
* [A list of open source C++ libraries](http://en.cppreference.com/w/cpp/links/libs)


## SQL

* [W3CSQL](https://www.w3schools.com/sql/default.asp)

## Java 高级主题

### Java 日志框架

* [Java日志框架那些事儿](https://www.cnblogs.com/chanshuyi/p/something_about_java_log_framework.html)
* [Log4j ConsoleAppender Configuration Example](https://howtodoinjava.com/log4j/log4j-console-appender-example/)

### Java I/O

* [Java IO](http://ifeve.com/java-io/)
* [java I/O书籍](https://www.comsince.cn/static/download/JavaIO.pdf)
* [Java NIO Tutorial](http://tutorials.jenkov.com/java-nio/index.html)
* [java nio解决半包 粘包问题](https://blog.csdn.net/nongfuyumin/article/details/78343999)

### Java Networking

* [Essential Netty in Action 《Netty 实战(精髓)》](https://www.kancloud.cn/kancloud/essential-netty-in-action)
* [SSL/TLS协议运行机制的概述](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)
* [Java Secure Socket Extension (JSSE) Reference Guide](https://docs.oracle.com/javase/6/docs/technotes/guides/security/jsse/JSSERefGuide.html)

### Java Connurency

* [Java并发编程实战](https://www.comsince.cn/static/download/Java-concurency-in-practice.pdf)
* [通俗解释java并发原理教程](http://tutorials.jenkov.com/java-concurrency/thread-signaling.html)
* [Java 并发编程的艺术](https://www.comsince.cn/static/download/Java_concurrency_artifact.pdf)

### Java Reflection
  
Java 动态代理机制实际是代理模式的实现，其局限性是其无法代码class只能代理接口，因此对于需要继承类但是父类需要反射，就会变得极其复杂
AOP模式实现切面编程中，利用职责链模式，建立一种拦截器模式，比如Servelet与filter机制，切面编程的advice拦截调用链
* [Java 动态代理机制分析及扩展](https://www.ibm.com/developerworks/cn/java/j-lo-proxy1/index.html)
* [深入理解Java：类加载机制及反射](https://yq.aliyun.com/articles/133181)

### Java web

* [Servelet规范](http://zhanjindong.com/assets/pdf/Servlet3.1-Specification.pdf)
* [Servelet规范-本地版](https://www.comsince.cn/static/download/Servlet3.1-Specification.pdf)

#### Spring 框架原理

* [深入解析Spring 内幕](https://www.comsince.cn/static/download/spring-tech-invoke_anayisis.pdf)
* [Spring的BeanFactoryPostProcessor和BeanPostProcessor](https://blog.csdn.net/caihaijiang/article/details/35552859)
* [Spring AOP aspect vs advisor 以及基于xml和annotation的两种配置](https://howtodoinjava.com/spring-aop/spring-aop-aspectj-xml-configuration-example/)
* [aop:aspect与aop:advisor的区别](https://blog.csdn.net/u011983531/article/details/70504281)
* [职责链模式(Chain of responsibility)以及servlet中filter的原理](http://dapple.iteye.com/blog/696008)

#### Spring 主要模块

* [Spring-Aop](https://docs.spring.io/spring-framework/docs/current/spring-framework-reference/core.html#aop)
* Spring-context
* Spring-jdbc 
* Spring-tx 支持数据库事务
* spring-session

### Spring boot

* [Spring Boot 2.0 极简教程](https://www.jianshu.com/p/fc24de0c585d)
* [《Spring Boot极简教程》第1章 Spring Boot史前简述](https://www.jianshu.com/p/ef6214ad115a)
* [《Spring Boot极简教程》第2章 Spring Boot简史](https://www.jianshu.com/p/4475f1d079b9)
* [第5章 Spring Boot自动配置原理](https://www.jianshu.com/p/346cac67bfcc)

#### 分布式session

* [通过 Spring Session 实现新一代的 Session 管理](https://www.infoq.cn/article/Next-Generation-Session-Management-with-Spring-Session)
* [Spring Session+Spring Data Redis 解决分布式系统架构中 Session 共享问题](https://juejin.im/post/58957c3b61ff4b006b066b1c)

#### 分布式锁

* [分布式锁的几种实现方式](https://www.hollischuang.com/archives/1716)

#### 权限设计

* [Shiro权限设计](https://waylau.com/apache-shiro-1.2.x-reference/II.%20Core%20%E6%A0%B8%E5%BF%83/6.%20Authorization%20%E6%8E%88%E6%9D%83.html)
* [新的RBAC：基于资源的权限管理(Resource-Based Access Control)](https://waylau.com/new-rbac-resource-based-access-control/)
* [Tomcat中session的管理机制](https://blog.csdn.net/lantian0802/article/details/8914157)


#### ORM 框架

* [myBatis-core](http://www.mybatis.org/mybatis-3/zh/index.html)
* [myBatis-spring](http://www.mybatis.org/spring/zh/)
* [《深入理解mybatis原理》 MyBatis的架构设计以及实例分析](https://blog.csdn.net/luanlouis/article/details/40422941)

#### 权限框架

* [跟我学Shiro](https://www.comsince.cn/static/download/kaitao-shiro.pdf

### 设计模式

* [研磨设计模式](https://www.comsince.cn)
* [图说设计模式](https://design-patterns.readthedocs.io/zh_CN/latest/)



## 微服务架构系列文章

## 基础组件

### 消息队列

* [activemq](http://activemq.apache.org/getting-started.html)
* [为什么选择RocketMQ消息中间件](https://mp.weixin.qq.com/s/KfBruI-tOz-eJuM2fgqyew?)

**NOTE:** ActiveMQ 5.15.0 Release 支持java8以上版本

### 分布式数据库

#### 数据库基本技能
* [SQL Tutorial](https://www.w3schools.com/sql/sql_join_inner.asp)


为提升系统性能，实现高并发的需要有事需要实现数据库读写分离，需要使用数据库中间件
读写分离需要配置主从数据同步

* [MySQL5.6 数据库主从（Master/Slave）同步安装与配置详解](http://blog.csdn.net/xlgen157387/article/details/51331244/)
* [Sharing-JDBC](http://shardingjdbc.io/docs/00-overview)

### 分布式RPC框架

#### 服务治理

* 限流
* 熔断
* 降级

#### Dubbo官方说明文档

* [Dubbo user guide](https://dubbo.gitbooks.io/dubbo-user-book/)
* [Dubbo develop guide](https://dubbo.gitbooks.io/dubbo-dev-book/)

#### Dubbo 原理分析系列文章
* [Spring Schema扩展](https://gist.github.com/dchjmichael/07dfd189c4c29bab63ec)
* [Dubbo spi 扩展点机制](http://cxis.me/2017/02/18/Dubbo%E4%B8%ADSPI%E6%89%A9%E5%B1%95%E6%9C%BA%E5%88%B6%E8%AF%A6%E8%A7%A3/)
* [XML Schema Authoring](https://docs.spring.io/spring/docs/5.1.2.RELEASE/spring-framework-reference/core.html#xml-custom)


### Hystrix
* [Hystrix原理与实战](https://my.oschina.net/7001/blog/1619842)

### 负载均衡

* [OpenResty Nginx](https://moonbingbing.gitbooks.io/openresty-best-practices/ngx/nginx_brief.html)

### 配置中心
* 实现配置修改，自动下发

### 容器

* DevOps

### 调用链

* [Dapper，大规模分布式系统的跟踪系统](https://bigbully.github.io/Dapper-translation/)
* [美团分布式会话跟踪系统架构设计与实践](https://tech.meituan.com/mt-mtrace.html)
* [京东分布式服务跟踪系统-CallGraph](http://zhuanlan.51cto.com/art/201701/528304.htm)

### 微服务实战
* [微服务实战：从架构到发布（一）](https://segmentfault.com/a/1190000004634172)
* [微服务实战：从架构到发布（二）](https://segmentfault.com/a/1190000004655274)

### 书籍

* [亿级流量网站架构核心技术 跟开涛学搭建高可用高并发系统](https://www.comsince.cn/static/download/kaitao-distribute-system.pdf)

## 大数据

* [大数据生态及其技术栈](http://www.code123.cc/1455.html)
* [大数据技术学习路线](http://heminit.com/2017/06/23/my-post2/)

### Hadoop

#### Hadoop Yarn
* [Hadoop新MapReduce框架Yarn详解](https://www.ibm.com/developerworks/cn/opensource/os-cn-hadoop-yarn/)

#### 文档
* [Hadoop 官方中文文档](http://hadoop.apache.org/docs//r1.0.4/cn/index.html)
* [Hadoop安装教程_单机/伪分布式配置](http://www.powerxing.com/install-hadoop/) 
* [大数据、云计算系统高级架构师课程学习路线图](http://www.bijishequ.com/detail/435478?p=)
* [开源书籍：大数据实验手册](https://chu888chu888.gitbooks.io/hadoopstudy/content/)
* [大数据建设平台学习](https://github.com/Roc-J/Hadoop/blob/master/big%20data/%E5%A4%A7%E6%95%B0%E6%8D%AE%E5%BB%BA%E8%AE%BE%E5%B9%B3%E5%8F%B0%E5%AD%A6%E4%B9%A0.md)

#### 视频资料
* [Hadoop2.x 深入浅出企业级应用实战视频下载](https://www.iteblog.com/archives/1129.html)
* [Hadoop大数据跳槽课程(线上视频+直播答疑)](http://www.itsource.com.cn/thread-41-1-1.html) 视频码`11664-F6AF-8E8D-C8FC-99BC`

#### 书籍资料
* [Hadoop实战-陆嘉恒](https://www.comsince.cn)
* [Hadoop权威指南-第三版](https://www.comsince.cn/static/download/largfile-100M/Hadoop-overall.pdf)
* [Hadoop技术内幕：深入解析Hadoop Common和HDFS](https://www.comsince.cn/static/download/bigdata/Hadoop_Common_HDFS.pdf)
* [Hadoop技术内幕：深入解析YARN架构设计与实现原理](https://www.comsince.cn/static/download/bigdata/Hadoop_YARN_artitect.pdf)
* [Hadoop技术内幕：深入解析MapReduce架构设计与实现原理 (大数据技术丛书)](https://www.comsince.cn/static/download/bigdata/Hadoop_MapReduce_artitect.pdf)

### Python
* [Python教程](https://www.liaoxuefeng.com/wiki/0014316089557264a6b348958f449949df42a6d3a2e542c000/001431608990315a01b575e2ab041168ff0df194698afac000)


## 技术博客
从技术博客中寻找解决问题的方案，下面列出较为出名的博客
* [美团技术博客](https://tech.meituan.com/)


## 搜索技术

### ElasticSearch
* [Elasticsearch 5.4 中文文档](http://cwiki.apachecn.org/pages/viewpage.action?pageId=4260360)
* [Elasticsearch 权威指南（中文版](https://es.xiaoleilu.com/index.html)


### Solr
* [SolrTutorial](http://www.solrtutorial.com/basic-solr-concepts.html)
* [Apache Solr Tutorial for Beginners](https://examples.javacodegeeks.com/enterprise-java/apache-solr/apache-solr-tutorial-beginners/)



## 机器学习

* [Python getstarted](https://anandology.com/python-practice-book/getting-started.html)

* [tensorflow-for-poets](https://codelabs.developers.google.com/codelabs/tensorflow-for-poets/index.html#0)
* [tf-android](https://codelabs.developers.google.com/codelabs/tensorflow-for-poets-2-tflite/#0)
* [TensorFlow固化模型](https://www.jianshu.com/p/091415b114e2)


### 源码解析

* [纯源码解析博客](http://www.iocoder.cn/)
