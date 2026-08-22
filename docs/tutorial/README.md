# 🎓 PPT Agent Pro · 从 0 到 1 源码级架构教学与面试通关指南

> **适用对象**：全栈工程师 / AI Agent 研发人员 / 正在准备大模型与 Multi-Agent 方向技术面试的求职者。
> **教学目标**：从零到一掌握工业级 Multi-Agent 系统的架构设计、状态机长流程编排、两级层次化大纲规划、Leader-Worker 并发生成、Review Agent 模块级四维质检自省闭环，以及 SSE 高可用工程落地。

---

## 📚 教程全集索引导航 (按模块自学)

| 序号 | 教学模块 | 核心内容与设计决策 | 源码落点 | 独立文档链接 |
| :--- | :--- | :--- | :--- | :--- |
| **00** | **全局架构与状态机全景篇** | S0~S3 业务流全景、14 阶段显式有限状态机、SSE 增量重放与 queryID 原子检查点持久化 | [`state-machine.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/core/state-machine.ts)<br/>[`event-bus.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/sse/event-bus.ts) | [📖 00_GLOBAL_ARCHITECTURE.md](./00_GLOBAL_ARCHITECTURE.md) |
| **01** | **阶段 0：意图识别与技能路由篇** | 对话框多意图智能拦截、显式 `@PPT` 指令与自然语言特征匹配、秒级主题萃取 | [`intent-router.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/intent-router.ts) | [📖 01_S0_INTENT_ROUTING.md](./01_S0_INTENT_ROUTING.md) |
| **02** | **阶段 1：自适应检索与需求对齐篇** | Query 结构化重写 + 初次 WebSearch 宽泛检索 + Agent Loop 1 主动提问（`Ask user question`）+ 二次精准 Rerank | [`clarification-agent.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/clarification-agent.ts)<br/>[`web-search.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/tools/web-search.ts) | [📖 02_S1_ADAPTIVE_SEARCH_AND_CLARIFICATION.md](./02_S1_ADAPTIVE_SEARCH_AND_CLARIFICATION.md) |
| **03** | **阶段 2：层次化大纲与模板解耦篇** | 5 大核心业务模块 + 1.1/1.2 子分块层次化 Markdown 大纲树、视觉模板库、HITL 双预览审批 | [`plan-strategist.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/plan-strategist.ts)<br/>[`template-matcher.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/template-matcher.ts) | [📖 03_S2_HIERARCHICAL_PLAN_AND_TEMPLATE.md](./03_S2_HIERARCHICAL_PLAN_AND_TEMPLATE.md) |
| **04** | **阶段 3：Leader-Worker 模块化生成篇** | Leader 模块级拆包分发（以 Section 为 Input 派发）、Sub-Agents 独立并发渲染 DrawingML/SVG | [`leader-agent.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/leader-agent.ts)<br/>[`worker-agent.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/worker-agent.ts) | [📖 04_S3_LEADER_AND_SUBAGENT_DISTRIBUTED.md](./04_S3_LEADER_AND_SUBAGENT_DISTRIBUTED.md) |
| **05** | **阶段 3：Review Agent 四维质检闭环篇** | **质检主体为 Sub-Agent 交付的整体大模块成果包**！四维综合质检（语法/排版溢出/大纲/意图）+ autoFix 原地自省修复 | [`review-agent.ts`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/server/src/agents/review-agent.ts)<br/>[`ReviewDashboard.vue`](file:///Users/bajiao/workspace/ppt-study/advanced-ppt-agent/web/src/components/ReviewDashboard.vue) | [📖 05_S3_REVIEW_AGENT_4D_QUALITY_LOOP.md](./05_S3_REVIEW_AGENT_4D_QUALITY_LOOP.md) |
| **06** | **面试终极通关宝典与 Q&A 直通车** | 1 分钟开场话术、简历四大核心技术亮点包装、高频刁钻面试追问与架构师满分回答模版 | 全链路核心代码 | [📖 06_INTERVIEW_MASTER_CHEATSHEET.md](./06_INTERVIEW_MASTER_CHEATSHEET.md) |

---

## 🖥️ 快速启动与本地体验

```bash
# 1. 进入工程目录
cd /Users/bajiao/workspace/ppt-study/advanced-ppt-agent

# 2. 运行自动化单元测试 (Vitest)
npm run test

# 3. 运行终端端到端完整演示
npm run demo

# 4. 启动前后端全栈开发环境
npm run dev
# 浏览器访问: http://localhost:5188 (前端) | http://localhost:3000 (后端 API)
```
