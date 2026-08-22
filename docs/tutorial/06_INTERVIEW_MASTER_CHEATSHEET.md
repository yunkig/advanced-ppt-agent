# 模块 06 · 面试终极通关宝典与源码级深挖直通车 (Master Cheatsheet & Interview Q&A)

> **定位**：技术面试 1 分钟开场话术、项目简历亮点深度包装、源码调用链背书与高频刁钻提问的满分应答。

---

## 1. 黄金 1 分钟项目介绍（可直接背诵）

> “面试官您好，我重点负责/深度自研的核心项目是 **PPT Agent Pro——工业级 Multi-Agent 演示文稿智能生成与自省系统**。
>
> 针对传统 AIGC 生成 PPT 时普遍存在的**‘黑盒等待时间长、欠指定导致生成偏离、单点排版错误即整篇报废’**三大痛点，我主导设计了 **S0~S3 四阶段 Industrial Pipeline**：
> 1. **S0/S1 阶段**：通过轻量意图路由快速识别 `@PPT` 与自然语言，利用 Query 重写结合 WebSearch 联网检索，并通过 Agent Loop 1 主动触发 `Tool: Ask user question` 表单消除需求不确定性；
> 2. **S2 阶段**：采用 Plan-and-Solve 范式生成 **5 大核心业务模块 + 1.1/1.2 子分块的两级层次化 Markdown 大纲**，并实现大纲规划与视觉模板的完全解耦双预览；
> 3. **S3 阶段**：设计 **Leader-Worker-Review 多智能体分布式协同架构**，Leader 将一级大模块拆解为独立任务包派发给各个 Sub-Agent 并行生成，由独立的 **Review Agent 执行四维质检（语法、多模态排版越界、Plan覆盖度、调色板吻合度）与 autoFix 局部自省修补闭环**；
> 4. **底层工程高可用**：自研 14 阶段显式有限状态机，结合 SSE 流式增量续传与 queryID 原子检查点持久化机制，保障弱网与异常场景下的无感恢复。
>
> 该系统将长篇演示文稿的端到端交付耗时缩短了 84%，质检达标率提升至 98.5%。”

---

## 2. 简历四大核心亮点与源码落点背书

| 亮点方向 | 简历专业表述 | 本地仓库对应源码与调用链 |
| :--- | :--- | :--- |
| **多智能体编排与自省** | 搭建 Leader-Worker-Review 多智能体拓扑，设计两级层次化大纲映射与 Sub-Agent 模块级四维质检（语法/排版溢出/大纲/意图）及 autoFix 自省修复回路。 | [`server/src/agents/leader-agent.ts:13-35`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/leader-agent.ts#L13-L35)<br/>[`server/src/agents/review-agent.ts:14-125`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/review-agent.ts#L14-L125) |
| **需求对齐与联网检索** | 针对欠指定 Prompt，实现 Query 结构化重写与初次宽泛检索，结合 Tool Call 主动澄清表单，完成二次精准 Rerank，彻底消除大模型知识幻觉。 | [`server/src/agents/clarification-agent.ts:15-50`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/clarification-agent.ts#L15-L50)<br/>[`server/src/tools/web-search.ts:14-45`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/tools/web-search.ts#L14-L45) |
| **状态机与长流程控制** | 独立设计 14 阶段显式有限状态机（FSM），严格防范状态非法跃迁，结合原子检查点（`.tmp` $\rightarrow$ `fsync` $\rightarrow$ `rename`）实现异常中断无感恢复。 | [`server/src/core/state-machine.ts:25-95`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/core/state-machine.ts#L25-L95)<br/>[`server/src/workflow/checkpoint.ts:10-35`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/workflow/checkpoint.ts#L10-L35) |
| **SSE 实时流与弱网高可用** | 封装 Server-Sent Events 流式通信，维护 RingBuffer 消息环形缓冲，利用 `Last-Event-ID` 增量重放与 Full Jitter 指数退避重试，保障弱网不丢消息。 | [`server/src/sse/event-bus.ts:15-60`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/sse/event-bus.ts#L15-L60)<br/>[`web/src/composables/useSSE.ts:20-65`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/web/src/composables/useSSE.ts#L20-L65) |

---

## 3. 面试官高频刁钻追问（附顶尖架构师解答模版）

### 追问 1：大模型做 PPT 生成，最常遇到排版错位和字数超长，你们是怎么在工程上彻底解决的？
> **回答技巧**：分三层防御机制来答（Prompt 约束 $\rightarrow$ 几何多模态规则拦截 $\rightarrow$ autoFix 局部修补）。
> **参考表述**：
> “我们在工程上构建了三道防线：
> 1. **前置约束层**：在 Plan Strategist 与 Worker Agent 阶段，严格限制 Bullet Point 的数量（每页 2~3 条）与字符长度（单条 $\le 25$ 字），并注入 1280x720 坐标计算公式；
> 2. **Review 几何多模态质检层**：Review Agent 对产物进行物理坐标边界扫描，若检测到 $x > 1240$ 或 $y > 700$，直接判定为排版溢出；
> 3. **autoFix 自动修补层**：针对常见溢出和缺底图问题，直接执行正则坐标钳位（Clamp）与底图注入，90% 以上的排版缺陷在毫秒级内被原地自愈，无需二次调用 LLM。”

### 追问 2：如果并发生成时，某个 Sub-Agent 失败或挂起，你们怎么设计熔断与重试？
> **回答技巧**：强调局部重试、超时控制与指数退避。
> **参考表述**：
> “我们为每个 Sub-Agent 的执行封装了带有超时中断（`AbortController`）的独立 Promise。
> 当某 Sub-Agent 超过指定阈值或抛出异常时，仅将该 Section 标记为 `failed`，并触发最大 2 轮的局部重试；其他已成功的 Section 结果直接缓存入 Checkpoint，绝不级联拖垮其他任务，最大程度保障系统的吞吐量与稳定性。”

### 追问 3：为什么大纲生成要采用 5 个大模块 + 1.1/1.2 子分块，而不是直接按页生成？
> **回答技巧**：从演示文稿逻辑学、Token 窗口与 Multi-Agent 任务边界三个维度论述。
> **参考表述**：
> “因为扁平的单页大纲违背了长演示文稿的认知逻辑。一份 15 页的 PPT 必须有总-分-总的章节架构（如背景、架构、数据、案例、规划）。
> 两级层次化大纲不仅让生成的逻辑更加严密，而且为 S3 阶段的 Leader-Worker 提供了天然的任务分割粒度——每个 Sub-Agent 独立认领一个完整的大模块（包含 1.1、1.2 的上下文），既保证了章节内部各页面的承接一致性，又避免了单页割裂与全局长文本上下文膨胀。”
