---
title: Superpowers vs Grill-me：一周 Vibe Coding 实测，两种 AI 协作流程的 Token、中断与准确性对比
author: comsince
author_title: FshareIM Team
author_url: https://comsince.cn
author_image_url: https://media.fsharechat.cn/minio-bucket-portrait-name/fsharechat.png
tags: [Vibecoding, Claude Code, Superpowers, Grill-me, iOS, IM, 即时通讯, 方法论, 实测]
image: /img/blog/2026-07-13/banner.png
---

在 [ios-chat-pro 的 Vibe Coding 复盘](./2026-06-29-ios-chat-pro-vibecoding-retrospective.md)之后，过去一周（7 月 5 日 – 7 月 12 日）我继续用 Claude Code 迭代这个 iOS IM 客户端，交替使用了两套 skill：**superpowers**（brainstorming → writing-plans → subagent-driven-development 的全流程套件）和 **grill-me**（开工前对设计方案进行"逼问式"访谈的单点 skill）。

这篇文章从**Token 消耗、中断打扰、生成准确性**三个维度给出对比。所有数据来自真实会话 transcript 的统计（含 subagent 侧链的单独存储消耗），不是印象分。

![Superpowers vs Grill-me：Vibe Coding 实测](/img/blog/2026-07-13/banner.png)

<!--truncate-->

---

## 一、两个 skill 各是什么

**superpowers** 是一整套"过程纪律"插件：

- `brainstorming`：写码前先澄清意图，给出带推荐项的选择题；
- `writing-plans`：产出分阶段的实施计划；
- `subagent-driven-development`：把计划拆给多个 subagent 并行/串行执行，主会话只做调度和验收；
- 还有 `systematic-debugging`、`finishing-a-development-branch` 等配套。

**grill-me（/grilling）** 只做一件事：在动手前把你按在椅子上盘问。它的规则很凶：

- 能从代码里查到的**事实**自己去查，绝不问你；
- 属于你的**决策**，一个一个问，每个问题附上它的推荐答案；
- 一次只问一个问题，问完等你确认才继续；
- 你不说"没问题"，它不许开工。

一个管全程，一个管开工前的五分钟——它们本来就不是同一层的东西，但实际用下来，grill-me 事实上抢占了 brainstorming 的生态位，所以值得放在一起比。

## 二、四个代表性会话的硬数据

四个会话都是"从需求到 commit"的完整功能交付，规模相近，模型主力都是同一档。superpowers 会话的 subagent 消耗单独存储，下表已合并计入。

| 会话（日期 / 功能） | 工作流 | 输出 token | 缓存读 | 缓存写 | 非缓存输入 | 提问轮次 | 执行期返工轮次 |
|---|---|---|---|---|---|---|---|
| 07-09 「+」菜单三功能（发起聊天/加好友/扫码） | **grill-me** + executing-plans | 327K | 56.8M | 2.1M | 38K | 8 | 4 |
| 07-09 文件消息微信风格卡片 | superpowers 全流程（8 个 subagent） | 243K | 19.0M | 2.0M | 244K | 1 | ~1 |
| 07-10 群聊 @ 提及 | superpowers 全流程（11 个 subagent） | 346K | 49.0M | 3.7M | 337K | 2 | 3 |
| 07-05 图片消息原图加载 + 大图浏览 | superpowers 全流程（19 个 subagent） | 411K | 50.6M | 4.1M | 479K | 6 | — |

按常见计价权重（输出 5×、缓存写 1.25×、缓存读 0.1×、非缓存输入 1×）折算成"加权百万 token"：

- grill-me 会话 ≈ **9.9**
- superpowers 三个会话分别 ≈ **5.9 / 11.6 / 12.7**

## 三、三个维度的对比结论

### 1. Token 消耗：总量打平，但"成本形状"完全不同

先说反直觉的结论：**盘问本身几乎不要钱**。grill-me 的 8 连问阶段只占整个会话消耗的零头，真正的大头永远在执行期。两种工作流的总消耗在同一量级（6~13 加权百万 token），差异更多来自任务规模，而不是 skill 本身。

但成本的**分布**截然不同：

- **grill-me 路线是"越聊越贵的长尾"。** 设计和执行挤在同一个上下文里，会话越长，每一步要回读的历史越多——它的缓存读高达 56.8M，是同期单会话最高值。好在缓存读是最便宜的计费项，这个数字吓人但不致命；真正的风险是逼近上下文上限触发压缩，压缩后模型会"忘事"。
- **superpowers 路线是"每个任务一笔固定冷启动费"。** 主会话保持苗条，但每个 subagent 都从零开始读文件、建立认知——非缓存输入（244K~479K）是 grill-me 会话（38K）的 6~12 倍，这部分是全价计费的。subagent 越多，重复认知成本越高：19 个 subagent 的会话，冷启动输入就吃掉 479K。

一句话：**任务链路长、上下文强相关 → grill-me 单上下文合算；任务可拆、彼此独立 → superpowers 的 subagent 分摊合算。**

### 2. 中断与授权：前置密集 vs 全程均匀

先排除一个干扰项：工具级授权（Bash、文件写入的允许弹窗）跟 skill 无关，取决于 settings 允许清单。这一周四个会话的授权拒绝次数都是 0~1，说明允许清单调好之后，这个维度上两者没有差别。

真正的差别在**决策中断**的分布：

- **grill-me 把所有打扰压缩在开场。** 8 个问题一次一个，大约占用开头的一段密集问答；用户全部回答完（"没有问题"）之后，执行期几乎零打扰——后续的用户消息全是新增需求，不是它在等授权。这带来一个隐性好处：**问完就可以走开**，去干别的。
- **superpowers 把中断摊平在全程。** brainstorming 问 1~2 个选择题（带推荐项，点一下就走），然后 spec 确认一次、计划确认一次、每个执行阶段结束还要一句"继续"。单次中断很轻，但**要求你全程在场**，人变成了流水线上的按钮。

哪种好取决于你的工作模式：想"想清楚再放手"选 grill-me；想全程掌控、随时纠偏选 superpowers。

### 3. 生成准确性：盘问深度 ≠ 覆盖广度，流程严密 ≠ 契约安全

这是最有意思的维度，两边各暴露了一个盲区。

**grill-me 的问题质量确实高。** 它严格执行了"事实自己查，决策才问人"：8 个问题每一个都先翻过 iOS 代码和 Android 端实现再开口，甚至在盘问阶段就发现了"iOS 生成的群二维码是 `group:<id>`，Android 用的是 `wildfirechat://group/<id>`，两端互扫不通"这种跨端契约 bug——这个问题在写第一行代码之前就进了计划。

**但它只盘问被问到的范围。** 那次盘问聚焦在「+」菜单和扫码的交互设计上，"添加朋友"的业务边界没被展开：搜索结果要排除已有好友、要排除自己、好友请求要带默认验证消息、好友关系变化后要刷新本地列表——这四条全是执行后用户看着真机提出来的，对应 4 个补丁 commit。盘问挖得深，不代表铺得广。

**superpowers 的 spec + plan 让单功能一次成型。** 文件消息卡片从 spec 到实现一条线走完，会话内几乎零返工。**但它逃逸了一个更贵的 bug：** 发出去的媒体消息 wire 层漏设了 `mediaType` 字段，iOS 端自测一切正常，Android 端点击文件毫无反应——直到后来专门开了一个 debug 会话才定位修掉。8 个 subagent 每个都只看自己那一段计划，**没有任何一个 subagent 的职责是"对端能不能用"**。视野被拆碎，契约就会从缝里漏出去。

结论：**两个 skill 都防不住"没有进入问题清单的隐性契约"。** grill-me 靠盘问逼出显性决策，superpowers 靠计划保证执行不走样，但跨端能不能通，最终防线仍然是双端真机联调。

## 四、Vibe Coding 实践清单

结合这一周的会话记录和踩过的坑，沉淀七条：

1. **组合技是最优解：grill-me 当前端，superpowers 当后端。** 效果最好的一次正是 07-09 会话：`/grill-me` 盘问定稿 → 直接衔接 superpowers 的 `executing-plans` 执行 → `finishing-a-development-branch` 收尾。grill-me 替代的是 brainstorming，不是整个 superpowers。

2. **给盘问喂料，问题质量翻倍。** 丢给它一张截图 + 一句"对照 android-chat-pro"，问题就从"你想要什么样的菜单"变成"Android 是右上角白色圆角卡片自绘弹层，iOS 的 UIMenu 样式与之不同，你要哪种"。有参照物的盘问才是真盘问。

3. **跨端契约写进 CLAUDE.md / 长期记忆，不要指望流程兜底。** `mediaType` 的教训之后，"媒体消息 wire 必须设 mediaType"进了长期记忆——否则每加一种新消息类型就会再踩一次。skill 管过程，契约得靠沉淀。

4. **设计和执行尽量分会话。** grill-me 会话的缓存读是 subagent 方案的 3 倍，而且长会话的上下文压缩会丢细节。盘问定稿后开新会话执行，两头的成本形状都能占到便宜。

5. **允许清单先调好，授权中断能压到零。** 四个会话的工具授权拒绝合计 ≤1 次，这不是 skill 的功劳，是 settings 允许清单的功劳。这件事一次投入长期受益。

6. **AI 说"完成"≠ 可用，装机自验后再 commit。** 本项目的约定是改完先装真机、用户验证通过才提交。上面每一个"执行期返工"都是在真机上看出来的——模拟器里跑通和双端联调通是两回事。

7. **小修小补别上重流程。** 一个滑动回弹 bug，`systematic-debugging` 单 skill 25 分钟、8 万输出 token 解决。给 30 行的 fix 套全流程，开销比 bug 本身贵一个量级。流程是给"改错了很贵"的任务准备的。

## 五、结尾

一周用下来，最大的体会是：**这两个 skill 争的不是"谁更好"，而是"打扰你的时机"。** grill-me 把认知成本前置——先痛苦二十分钟，换执行期的清净；superpowers 把认知成本摊薄——每一步都轻，但每一步都要你在。token 上谁也没比谁省多少，准确性上谁也没能替你做双端联调。

Vibe coding 的"vibe"不是放手不管，而是把人的注意力花在只有人能做的三件事上：**给参照物、做决策、真机验收。** 剩下的，交给流程。

---

*数据来源：Claude Code 2026-07-05 ~ 2026-07-12 的会话 transcript（含 subagent 侧链），及 ios-chat-pro 仓库同期 git log。token 为 API usage 字段原始值，加权折算权重见文中说明。*
