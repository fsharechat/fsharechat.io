---
title: CAST keyword
sidebar_label: CAST
description: CAST SQL keyword reference documentation.
---

Type conversion. Can be either:

- [Explicit](#explicit-conversion) via `cast()`
- [Implicit](#implicit-conversion), in which case it will be automatically
  performed when required by the context.

## Explicit conversion

Types can be converted from one to another using the `cast()` function.

### Syntax

![Flow chart showing the syntax of the CAST keyword](/img/docs/diagrams/cast.svg)

where:

- `expression` can be a constant, a column, or an expression that evaluates to a
  value.
- `type` refers to the desired [data type](/docs/reference/sql/datatypes/).

`cast` can be used a part of arithmetic expression as normal

### Examples

```questdb-sql title="Queries"
SELECT
cast(3L + 2L AS INT),
cast(1578506142000000 AS TIMESTAMP),
cast('10.2' AS DOUBLE),
cast('行' AS INT);
```

| cast | cast1                       | cast2 | cast3 |
| ---- | --------------------------- | ----- | ----- |
| 5    | 2020-01-08T17:55:42.000000Z | 10.2  | 34892 |

Explicit casting of an expression to a smaller
[data type](/docs/reference/sql/datatypes/) may result in loss of data when the
output data type is smaller than the expression.

- Casting a decimal number type (`float` or `double`) to an integer number type
  (`long`, `int`, `short`) will result in decimals drop.
- If the integer part being cast is larger than the resulting data type, it will
  be resized by truncating bits.
- Conversions from `char` to a number type will return the corresponding
  `unicode` number and vice versa.

### Precision loss examples

```questdb-sql title="Queries"
SELECT
cast(3.5 + 2 AS INT),
cast(7234623 AS SHORT),
cast(2334444.323 AS SHORT);
```

| cast | cast1 | cast2  |
| ---- | ----- | ------ |
| 5    | 25663 | -24852 |

When casting numbers into a smaller data type, QuestDB will truncate the higher
bits of this number.

## Implicit conversion

Type casting may be necessary in certain context such as

- Operations involving various different types
- Inserting values where the originating type is different from the destination
  column type.

QuestDB will attempt to convert to the data type required by the context. This
is called `implicit cast` and does not require using the `cast()` function.

:::note

QuestDB will only perform implicit cast when they would not result in data being
truncated or precision being lost.

:::

The below chart illustrates the explicit and implicit cast available in QuestDB.

![Table showing the different possibilities the cast function supports, those are defined by an input and output types](/img/docs/castmap.jpg)

:::note

Implicit casting prevents data loss. When an operation involves multiple types,
the resulting type will be the smallest possible type so that no data is lost.

:::

```questdb-sql title="Queries"
SELECT
1234L + 567,
1234L + 0.567,
to_timestamp('2019-10-17T00:00:00', 'yyyy-MM-ddTHH:mm:ss') + 323,
to_timestamp('2019-10-17T00:00:00', 'yyyy-MM-ddTHH:mm:ss') + 0.323;
```

| cast | cast1    | cast2                       | cast3            |
| ---- | -------- | --------------------------- | ---------------- |
| 1801 | 1234.567 | 2019-10-17T00:00:00.000323Z | 1571270400000000 |

When inserting into a table, QuestDB will cast data implicitly to match the type
of the destination column.

```questdb-sql title="Example"
-- We create a table with one column of type long
CREATE TABLE my_table(my_number long);

-- We then insert a value into this table. Note that the value is of timestamp type
-- but that we are trying to insert into a long type column:
INSERT INTO my_table values((to_timestamp('2019-10-17T00:00:00', 'yyyy-MM-ddTHH:mm:ss'));

-- As timestamp can be converted to long without loss, QuestDB performs an implicit
-- cast on the value before inserting it. Therefore the value is now stored as a long:
SELECT * FROM my_table;
```

| my_number        |
| ---------------- |
| 1571270400000000 |

The above insert would have been equivalent to running with explicit cast, but
QuestDB took care of this step automatically.

```questdb-sql title="Example"
INSERT INTO my_table values
            (cast(
                to_timestamp('2019-10-17T00:00:00', 'yyyy-MM-ddTHH:mm:ss')
                AS LONG
            ));
```

| my_number        |
| ---------------- |
| 1571270400000000 |
