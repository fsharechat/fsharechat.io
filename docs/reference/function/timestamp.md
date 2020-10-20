---
title: Timestamp function
sidebar_label: Timestamp
description: Timestamp function reference documentation.
---

`timestamp(columnName)` elects a
[designated timestamp](/docs/concept/designated-timestamp/):

- during a [CREATE TABLE](/docs/reference/sql/create-table/#timestamp) operation
- during a [SELECT](/docs/reference/sql/select/) operation (`dynamic timestamp`)

## Syntax

### During a CREATE operation

![Flow chart showing the syntax of the TIMESTAMP keyword](/img/docs/diagrams/timestamp.svg)

Create a [designated timestamp](/docs/concept/designated-timestamp/) column
during table creation. For more information, refer to the
[CREATE TABLE](/docs/reference/sql/create-table/) section.

### During a SELECT operation

![Flow chart showing the syntax of the timestamp function](/img/docs/diagrams/dynamicTimestamp.svg)

Creates a [designated timestamp](/docs/concept/designated-timestamp/) column in
the result of a query.

:::caution

The output query must be ordered by time. `TIMESTAMP()` does not check for order
and using timestamp functions on unordered data may produce unexpected results.

:::

:::tip

Dynamic timestamp allows to perform time series operations such as `LATEST BY`,
`SAMPLE BY` or `LATEST BY` on tables which do not have a `designated timestamp`.

:::

## Examples

### During a CREATE operation

The following creates a table with
[designated timestamp](/docs/concept/designated-timestamp/).

```questdb-sql title="Create table"
CREATE TABLE
temperatures(ts timestamp, sensorID symbol, sensorLocation symbol, reading double)
timestamp(ts);
```

### During a SELECT operation

The following will query a table and assign a
[designated timestamp](/docs/concept/designated-timestamp/) to the output. Note
the use of brackets to ensure the timestamp clause is applied to the result of
the query instead of the whole `readings` table.

```questdb-sql title="Dynamic timestamp"
(SELECT cast(dateTime AS TIMESTAMP) ts, device, value FROM readings) timestamp(ts);
```

Although the `readings` table does not have a designated timestamp, we are able
to create one on the fly. Now, we can use this into a subquery to perform
timestamp operations.

```questdb-sql title="Dynamic timestamp subquery"
SELECT ts, avg(value) FROM
(SELECT cast(dateTime AS TIMESTAMP) ts, value FROM readings) timestamp(ts)
SAMPLE BY 1d;
```

If the data is unordered, it is important to order it first.

```questdb-sql title="Dynamic timestamp - unordered data"
SELECT ts, avg(value) FROM
(SELECT ts, value FROM unordered_readings ORDER BY ts) timestamp(ts)
SAMPLE BY 1d;
```
