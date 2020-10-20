---
title: InfluxDB line protocol on QuestDB
author: David G. Simmons
author_title: QuestDB Team
author_url: https://github.com/davidgs
author_image_url: https://avatars.githubusercontent.com/davidgs
description:
  How to use InfluxDB line protocol with QuestDB, this example shows an IoT
  application.
tags: [influxdb line protocol]
---

<img
  alt="Blue sky surrounded by latice-work"
  className="banner"
  src="/img/blog/2020-07-22/banner.jpg"
/>

<div className="banner" style={{ fontSize: "14px", marginBottom: "1rem" }}>
  Photo by&nbsp;
  <a href="https://unsplash.com/@ripato?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">
    Ricardo Gomez Angel
  </a>&nbsp;on&nbsp;
  <a href="https://unsplash.com/collections/1231819/influx?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">
    Unsplash
  </a>
</div>

We've had a UDP version of the InfluxDB Line Protocol (ILP) reader in QuestDB
for quite some time, but we've had customers ask for a TCP version of it, so we
delivered!

Using it, and configuring it, are relatively simple so don't expect this to be a
long post but I'll walk you through the basics of how to set it up and use it.
For an added bonus I'll show you how to migrate from using InfluxDB to using
QuestDB with a less than a line of configuration.

<!--truncate -->

## Configuring TCP InfluxDB line protocol listener

Here's the best part, at least for a basic implementation that you don't need to
performance tune at all: It's already set up.

That's right, as soon as you start QuestDB both the UDP and TCP ILP listeners
start automatically on port 9009. Yes, TCP and UDP both use the same port. No,
that's not a problem since one is UDP and one is TCP.

There are a bunch of configuration options you can tune in your
`conf/server.conf` file if you're interested. I won't go through them here, but
you can read all about them in our [docs](/docs/api/influxdb-line-protocol/). I
hope they are relatively self-explanatory.

## InfluxDB line protocol refresher

If you have used ILP before, this should all be review. If you're new to ILP,
this will tell you how you should write your data to QuestDB.

### Basic structure

```shell title="ILP syntax"
table_name,tagset valueset timestamp
```

Pretty basic. So let's dive into what each element actually is, and how to
structure a line of ILP for writing.

The first element is the `table_name` portion, which tells the ILP writer which
database table to write values into.

Next comes the set of tags you want to use. These are standard `key=value`
pairs, and you can add as many of them as you want or need. Just separate them
with commas.

There should only ever be 2 spaces in your line protocol. No more. The first
space separates your `tags` from the `values` you want to associate with those
`tags`s. The second space separates the values from the timestamp for those tags
and values.

The values are also `key=value` pairs, and again you can send as many as you
want in a line.

Finally comes your `timestamp` value, typically in µSeconds.

### Example ILP

Let's use an example of writing some environmental data to QuestDB. I have a
sensor that reads temperature, atmospheric pressure, humidity, and the altitude.

| Reading     | Value       |
| ----------- | ----------- |
| Temperature | 23.180000   |
| Humidity    | 51.982422   |
| Pressure    | 1002.112061 |
| Altitude    | 93.146370   |

And I want to use the following `tag`s:

| Tag Name | Tag Value |
| -------- | --------- |
| dev_id   | THP002    |
| dev_loc  | Apex      |
| dev_name | BME280    |

And my `table_name` is `iot`

Now I have all the basic elements I need to construct my ILP, which will look
like this:

`iot,dev_id=THP002,dev_loc=Apex,dev_name=BME280 temp_c=23.18,altitude=93.10,humidity=52.16,pressure=1002.12`

And yes, I rounded those values. But you'll notice that I did not add a
`timestamp` value. In this case, it's because I am sending the values from a
small, embedded sensor device that really doesn't have a great sense of time. By
sending the ILP without a `timestamp` I'm telling the database itself to add one
for me, using the arrival time as the `timestamp`.

## Database structure

One of the cool features of using the ILP reader (well, QuestDB in general
really) is the ability to do 'Schema on Write'.

What that means is that if an ILP message arrives, QuestDB will automatically
create tables and columns to fit the incoming ILP. So if you need to add a `tag`
later, you can add it to the new device's tagset and start writing. The new tag
will get added to the schema.

If you leave a tag value off, and it exists in the database, it will get filled
with a `null` value.

When I start writing the above ILP to QuestDB, I'll get a table that looks like
this:

| dev_id | dev_name | temp_c | humidity | timestamp                   | dev_loc | altitude | pressure |
| ------ | -------- | ------ | -------- | --------------------------- | ------- | -------- | -------- |
| THP002 | BME280   | 26.52  | 51.94    | 2020-07-21T14:54:59.156202Z | Apex    | 76.27    | 1004.12  |
| THP002 | BME280   | 26.54  | 51.85    | 2020-07-21T14:54:59.157358Z | Apex    | 75.97    | 1004.16  |
| THP002 | BME280   | 26.56  | 51.83    | 2020-07-21T14:54:59.157389Z | Apex    | 75.84    | 1004.17  |
| THP002 | BME280   | 26.58  | 51.79    | 2020-07-21T14:54:59.287416Z | Apex    | 75.93    | 1004.16  |

This is what that table looks like in the QuestDB Web Console:

![Table in QuestDB Web Console](/img/blog/2020-07-22/tableShot.png)

## But how did you write that?

Oh, so how did I write that ILP to QuestDB? Well, my sensor is an Arduino, with
a Bosch BME280 sensor attached. It is WiFi connected, so a `WiFiClient` can do
the TCP write for me:

```C title="WiFiClient Connect"
espClient.connect(Quest_Server, 9009);
```

Will connect the client to the QuestDB Server defined by `Quest_Server` on port
`9009`.

If I then have a line of ILP like this:
`iot,dev_id=THPL002,dev_loc=Demo,dev_name=BME280 temp_c=23.18,altitude=93.10,humidity=52.16,pressure=1002.12\n`
in a `buffer` I can call `espClient.printf(buffer);` and that line of data will
be written to QuestDB.

## Can I do batch writes?

Of course you can! Just put each line of ILP on a separate 'line', separated by
a newline `\n` and then when you have all your batch built up, write the whole
thing to QuestDB.

Of course, if you're relying on QuestDB to add `timestamps` for you, then just
be aware that the entire batch will be given sequential timestamps based on when
they are read/written to the database.

## Conclusions

InfluxDB Line Protocol (ILP) is a simple, well-known, and relatively compact
data format for sending Time Series data to a database. That's why we decided to
support it.

As I told you in the beginning, I'm now going to give you a simple,
less-than-one-line configuration change to migrate from using InfluxDB to using
QuestDB. If you're using Telegraf as a data collector, that is.

Edit your `/etc/telegraf.conf` file (it may be in different places, depending on
your operating system) and change the line:

```shell
[[outputs.influxdb]]
  urls = ["http://127.0.0.1:8086"]
```

to be:

```shell
[[outputs.influxdb]]
  urls = ["tcp://127.0.0.1:9009"]
```

That's it. That's the migration. Now all data that was previously being written
to InfluxDB will now be written to QuestDB.
