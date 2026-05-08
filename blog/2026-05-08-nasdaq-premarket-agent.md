---
title: 用 LangGraph + Claude 构建纳斯达克100盘前日报 Agent
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [AI, LangGraph, Claude, Agent, 量化, 美股, 飞享IM]
---

每个工作日美东时间 8:00 AM，一个 Agent 自动从多个渠道并行采集信息，调用 Claude 生成中文盘前日报，通过飞享IM推送到手机。整个流程无人值守，从数据采集到消息送达不到 20 秒。

<!--truncate-->

## 架构一览

整个 Agent 基于 **LangGraph 状态机**实现，采用经典的 fan-out / fan-in 拓扑：

```
START
  ├── search_tech_news    ─┐
  ├── search_macro_news   ─┤
  ├── search_earnings     ─┼──► generate_report ──► send_notification ──► END
  ├── search_futures      ─┤
  └── fetch_stock_movers  ─┘
```

五个节点从 START **并行启动**，全部完成后汇入 `generate_report`。LangGraph 的 fan-out/fan-in 机制原生支持这种模式，无需手写锁或计数器。

---

## 状态设计

```python
class NasdaqReportState(TypedDict):
    date: str
    raw_articles: Annotated[list[dict], operator.add]  # reducer 自动合并四路搜索结果
    stock_movers: str        # 涨跌幅榜（markdown 表格）
    report_content: str      # Claude 生成的中文日报
    send_status: str         # 通知推送结果
```

`raw_articles` 字段用 `operator.add` 作为 reducer：四个搜索节点各自追加结果，LangGraph 负责合并，无需任何同步原语。

---

## 各节点详解

### 并行搜索（4个节点）

使用 `httpx.AsyncClient` 异步抓取 DuckDuckGo HTML 页面，BeautifulSoup 解析结果。

| 节点 | 搜索主题 |
|------|---------|
| `search_tech_news` | 纳斯达克100科技股盘前动态 |
| `search_macro_news` | 美联储利率、宏观经济数据 |
| `search_earnings` | 科技股财报预告与盈利情况 |
| `search_futures` | QQQ / 纳指期货盘前走势 |

**为什么不用 `ddgs` 库？**  
`duckduckgo-search` 底层依赖 `primp`（Rust HTTP 客户端，自带 TLS 实现），与部分 Linux 服务器的 OpenSSL 不兼容，会触发 Segmentation fault。改用 `httpx` 直接抓取 HTML，彻底绕开这个坑。

### 股票行情（fetch_stock_movers）

调用**东方财富 push2 批量行情接口**获取纳斯达克100全部成分股实时价格。

```
GET https://push2.eastmoney.com/api/qt/ulist.np/get
参数：fltt=2&invt=2&fields=f12,f2,f3
      secids=105.AAPL,105.MSFT,...  （纳斯达克前缀 105）
```

**为什么不用 Yahoo Finance / yfinance？**
- Yahoo Finance 对国内服务器 IP 触发 429 限速
- `yfinance` 底层同样依赖 `primp`，存在 TLS 兼容问题

东方财富 push2 接口国内直连稳定，无需认证，单次请求返回全部100支股票数据。盘前时段（ET 4:00–9:30 AM），`f2` 字段直接反映盘前最新成交价，`f3` 为相对前收盘的涨跌幅。

输出格式：

```markdown
**涨幅前十（实时行情）**

| 代码 | 价格 | 涨跌幅 |
|:---|---:|---:|
| NVDA | $211.50 | +1.77% |
...
```

### 报告生成（generate_report）

收集到所有数据后，调用 `claude-sonnet-4-6` 生成中文日报：

- 取前 20 条搜索结果，每条摘要截断为 200 字，避免 token 超限
- 股票涨跌榜直接嵌入 System Prompt 的固定格式模板
- 最终报告限制在 **2048 字符**（飞享IM通知接口限制）

日报固定格式：
```
【纳斯达克100盘前日报】2026-05-08

📊 市场概况
📊 盘前三大热点
📈 盘前涨跌幅前十
⚠️ 风险提示
```

### 通知推送（send_notification）

通过飞享IM开放平台接口将日报推送到指定手机：

```http
POST https://backend-http.fsharechat.cn/imopenapi/pushNotificationByMobile
Content-Type: application/json

{
  "mobiles": [13900000001],
  "content": {
    "content": {
      "type": 1,
      "searchableContent": "<日报内容>"
    }
  }
}
```

---

## 两个关键设计决策

### 全部节点用 `async def`

LangGraph 执行并行节点时：
- 同步节点（`def`）→ `ThreadPoolExecutor` 多线程并发 → `primp`/`curl_cffi` 在多线程下 segfault
- 异步节点（`async def`）→ asyncio 协程并发 → 无线程，彻底规避

所有节点改为 `async def`，通过 `graph.ainvoke()` 调用，5个并行节点由 asyncio 事件循环协调，无任何线程竞争。

### httpx 设置 `trust_env=False`

东方财富请求中加入 `trust_env=False`，防止服务器上配置的 HTTP 代理（透明代理或 VPN）干扰对东方财富的直连请求。

---

## 定时调度

使用 **APScheduler（AsyncIOScheduler）** 集成在 FastAPI `lifespan` 中：

```python
scheduler = AsyncIOScheduler(timezone="America/New_York")
scheduler.add_job(
    _run_nasdaq_report,
    "cron",
    day_of_week="mon-fri",
    hour=8,
    minute=0,
)
```

`timezone="America/New_York"` 自动处理美国夏令时（EDT/EST），无需手动维护 UTC 偏移。触发时间对应北京时间：夏令时 20:00 / 冬令时 21:00。

---

## 手动触发

开发调试或手动补发：

```bash
curl -X POST http://localhost:8000/nasdaq/trigger
# {"status": "triggered", "date": "2026-05-08"}
```

任务后台异步执行，接口立即返回。

---

## 实际运行日志

```
[nasdaq] Starting daily report for 2026-05-08 ...
[nasdaq] search_tech: 3.21s → 5 results
[nasdaq] search_macro: 2.87s → 5 results
[nasdaq] search_earnings: 3.54s → 4 results
[nasdaq] search_futures: 2.96s → 5 results
[nasdaq] fetch_stock_movers: 1.43s → 98 tickers (实时行情)
[nasdaq] generate_report: 8.12s → 1876 chars
[nasdaq] send_notification: 0.34s → ok:200
[nasdaq] Daily report complete.
```

5个并行节点最慢耗时 3.54s，Claude 生成报告 8.12s，全流程约 **12秒**完成。

---

## 依赖清单

| 库 | 用途 |
|----|------|
| `langgraph` | 状态机编排，fan-out/fan-in 并行执行 |
| `langchain-anthropic` | 调用 Claude 生成日报 |
| `httpx` | 异步 HTTP 客户端（搜索 + 行情 + 通知） |
| `beautifulsoup4` + `lxml` | 解析 DuckDuckGo HTML 搜索结果 |
| `apscheduler` | 定时任务调度 |
| `pytz` | 时区处理（美东时间 DST） |

---

飞享IM开放平台的推送接口让 Agent 的输出直达手机，这是整个方案中最顺手的一环。如果你也在用 LangGraph 做数据采集类 Agent，欢迎交流。
