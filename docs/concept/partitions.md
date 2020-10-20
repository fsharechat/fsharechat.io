---
title: Partitions
sidebar_label: Partitions
description:
  Overview of QuestDB's partition system for time-series. This is an important
  feature that will help you craft more efficient queries.
---

QuestDB offers the option to partition tables by intervals of time. Data for
each interval is stored in separate sets of files.

<img
  alt="Diagram of data column files and how they are partitioned to form a table"
  className="screenshot--shadow screenshot--docs"
  src="/img/docs/concepts/partitionModel.svg"
/>

## Properties

- Available partition intervals are `NONE`, `DAY`, `MONTH` and `YEAR`.
- Default behaviour is `PARTITION BY NONE`.
- Partitions are defined at table creation. For more information, refer to
  [CREATE TABLE section](/docs/reference/sql/create-table/).

## Requirements

Partition is only available on tables with a `designated timestamp`. The main
benefit of using a designated timestamp is that the field in question will
enforce an increasing policy on timestamp value. This allows you to leverage
specific high-performance time series functions. For more information on
`designated timestamp`, refer to the
[designated timestamp section](/docs/concept/designated-timestamp/).

## Advantages

- Reduced disk IO for timestamp interval searches. This is because our SQL
  optimiser leverages partitioning.
- Significantly improved calculations and seek times. This is achieved by
  leveraging the chronology and relative immutability of data for previous
  partitions.
- Physical separation of data files. This makes it easily to implement file
  retention policies or extract certain intervals.

## Storage example

Each partition effectively is a directory on the host machine corresponding to
the partitioning interval. In the example below, we assume a table `trips` that
has been partitioned using `PARTITION BY MONTH`.

```
[quest-user trips]$ dir
2017-03	    2017-10 	2018-05	    2019-02
2017-04	    2017-11 	2018-06	    2019-03
2017-05	    2017-12 	2018-07	    2019-04
2017-06	    2018-01 	2018-08 	2019-05
2017-07	    2018-02 	2018-09 	2019-06
2017-08	    2018-03 	2018-10
2017-09	    2018-04 	2018-11
```

Each partition on the disk contains the column data files of the corresponding
timestamp interval.

```
[quest-user 2019-06]$ dir
_archive    cab_type.v              dropoff_latitude.d     ehail_fee.d
cab_type.d  congestion_surcharge.d  dropoff_location_id.d  extra.d
cab_type.k  dropoff_datetime.d      dropoff_longitude.d    fare_amount.d
```
