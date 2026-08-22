<div align="center">

# 🚀 PPT Agent Pro (Advanced PPT Agent)

### 工业级全链路 Multi-Agent 智能演示文稿生成系统

[![Test Status](https://img.shields.io/badge/tests-5%20passed-success?style=flat-square&logo=vitest)](./server/test/full-pipeline.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-emerald?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/yunkig/advanced-ppt-agent/pulls)

<p align="center">
  <a href="#-核心特性亮点">核心特性</a> •
  <a href="#-全景架构图">系统架构</a> •
  <a href="#-14-阶段有限状态机">状态机设计</a> •
  <a href="#-快速启动与演示">快速上手</a> •
  <a href="#-sse-流式通信与断线重连规范">SSE 协议</a> •
  <a href="#-全套源码级教程与面试指南">教程与面试</a> •
  <a href="#-技术栈">技术栈</a>
</p>

</div>

---

## 📖 项目简介

**PPT Agent Pro** 是一套面向企业级落地的 **全链路 AIGC 多智能体（Multi-Agent）演示文稿生成系统**。

针对传统大模型一次性黑盒生成 PPT 存在的 **“长耗时无反馈”、“长上下文风格漂移与遗忘”、“单页排版崩溃导致整篇报废”** 等痛点，本项目完整落地了从需求输入到最终二进制 PPTX 导出的全流程编排：

$$\text{S0 意图识别与技能路由} \longrightarrow \text{S1 自适应联网检索与需求对齐} \longrightarrow \text{S2 层次化大纲规划与模板映射} \longrightarrow \text{S3 分布式生成与四维质检闭环}$$

---

## ✨ 核心特性亮点

### 🤖 1. 工业级 Leader-Worker-Review 多智能体协同拓扑
- **Leader Agent**：将复杂的整份 PPT 拆解为多个独立业务大模块（Section），派发给独立的 Sub-Agents。
- **Worker Sub-Agents**：并发生成各自负责的层次化页面（如 1.1 / 1.2 分块），上下文相互隔离，彻底解决 Token 爆炸与长文本风格衰减。
- **Review Agent（四维质检闭环）**：对每个 Sub-Agent 交付的产物执行 **语法与表述校验、视觉排版多模态校验（溢出/重叠/缺页）、Plan 大纲结构符合度、原始意图吻合度** 四维核验，具备 `autoFix` 局部补丁与原地重做自省回路。

### 🔄 2. 14 阶段显式有限状态机 (Deterministic FSM)
- 采用严格的显式转移表（Transition Rule Set），彻底杜绝状态非法越权跳转。
- 提供 `onEnter` / `onLeave` 统一生命周期钩子，实现原子化的状态广播、时间戳打标与持久化触发。

### ⚡ 3. SSE 流式传输与高可用断线重放
- **服务端 Ring Buffer**：维护循环事件缓冲区，记录所有历史阶段与日志。
- **增量续传**：基于标准 HTTP `Last-Event-ID` 机制，网络抖动或断线重连后无缝从指定序列号补齐丢包。
- **指数退避 + Full Jitter**：客户端内置抖动退避重连算法，有效防止服务器重启时的海量瞬时网络风暴。

### 📝 4. 层次化大纲规划 (Plan-and-Solve) 与双预览模板系统
- 结构化生成 **5 大核心业务模块 + 1.x 子分块页面** 的层次化 Markdown 大纲树。
- 模版匹配引擎根据行业场景自适应推荐配色规范与调色板，提供 HITL（Human-in-the-Loop）大纲与可视化卡片双重审批流。

### 🔍 5. 自适应双阶段检索 (Adaptive Search & Rerank)
- **初次宽泛检索**：Query 结构化重写与初次 WebSearch 检索。
- **需求澄清循环**：通过 `Ask user question` 表单反问用户关键参数（页数、受众、风格偏好）。
- **二次精准 Rerank**：结合澄清参数二次重排知识库，输出高质量精简上下文。

### 💾 6. QueryID 原子写盘与崩溃恢复 (Crash-Safe Checkpoint)
- 每次阶段流转自动触发快照落盘：采用 **“先写 `.tmp` 临时文件 $\rightarrow$ `fsync` 刷盘 $\rightarrow$ 原子 `rename`”** 流程，避免意外断电造成 JSON 损坏。
- 支持任意时刻通过 `WorkflowRunner.runFromCheckpoint(queryID)` 恢复到中断现场继续推进。

### 📱 7. 现代化全栈双端可视化界面 (Vue 3 + Tailwind CSS)
- 提供响应式 **手机端模拟器 UI** 与桌面端管理后台。
- 包含实时阶段进度指示器、SSE 实时控制台、HITL 澄清/大纲审批弹窗、四维质检实时雷达仪表盘。

---

## 📐 全景架构图 (S0 ~ S3)

```mermaid
flowchart TD
    subgraph S0 [阶段 0：意图识别与技能路由]
        U[用户输入 Prompt / @PPT 指令] --> IntentLLM[IntentRouter Agent]
        IntentLLM -->|判定命中 PPT 生成| S1_Entry[进入 PPT 生成流水线]
        IntentLLM -->|普通聊天| Chat[常规对话分支]
    end

    subgraph S1 [阶段 1：自适应联网检索与需求对齐]
        S1_Entry --> Parallel_S1{并行执行}
        Parallel_S1 --> Rewrite[大模型 Query 结构化重写]
        Parallel_S1 --> Search1[初次 WebSearch 宽泛检索]
        Rewrite & Search1 --> ClarifyLoop[Agent Loop 1: 需求澄清]
        ClarifyLoop --> ToolAsk1[Tool: Ask user question<br/>前端表单: 页数 / 风格 / 目标受众]
        ToolAsk1 --> UserFeedback1[用户回填关键参数]
        UserFeedback1 --> Search2[二次精准 WebSearch 检索 & 知识重排 Rerank]
    end

    subgraph S2 [阶段 2：层次化大纲规划与模板映射]
        Search2 --> PlanLoop[Agent Loop 2: Plan & Solve]
        PlanLoop --> HierPlan[生成 5 大模块 + 1.1/1.2 层次化 Markdown 大纲]
        HierPlan --> TemplateMatch[智能匹配推荐视觉模板卡片]
        TemplateMatch --> HITL_Gate[HITL 审批门禁: 大纲与模板双预览]
        HITL_Gate --> UserDecision[用户确认或切换模板]
    end

    subgraph S3 [阶段 3：分布式生成与多模态质检闭环]
        UserDecision --> Leader[Leader Agent: 模块级拆包与分发]
        Leader -->|派发 Section 1| Worker1[Sub-Agent 1: 生成 1.1, 1.2 页面组]
        Leader -->|派发 Section 2| Worker2[Sub-Agent 2: 生成 2.1, 2.2 页面组]
        Leader -->|派发 Section K| WorkerK[Sub-Agent K: ...]
        
        Worker1 & Worker2 & WorkerK --> Review[Review Agent: 四维独立质检]
        
        subgraph ReviewChecks [四维质检标准]
            C1[1. 语法与表述校验]
            C2[2. 视觉排版校验 (防文字溢出/重叠/缺页)]
            C3[3. Plan 大纲结构符合度]
            C4[4. 用户原始诉求吻合度]
        end
        
        Review --> ReviewChecks
        ReviewChecks -->|质检不达标| AutoFix{自省修复判定}
        AutoFix -->|局部排版缺陷| Patch[In-place 局部补丁修补]
        AutoFix -->|结构性缺失| Worker1
        Patch --> Review
        ReviewChecks -->|全量达标| Merge[多模块成果物合并 & Python PPTX 编译器]
    end

    Merge --> Done([🎉 导出原生 .pptx / 进入交付展示环节])
```

---

## 🔄 14 阶段有限状态机 (FSM Lifecycle)

本项目状态机在 `server/src/core/state-machine.ts` 中以纯函数状态转移矩阵进行定义：

| 阶段代码 (State) | 所属阶段 | 触发原因 (Reason) | 核心动作与职责 | 产出成果 / 检查点 |
| :--- | :--- | :--- | :--- | :--- |
| `S0_intent_routing` | **S0** | `init` | 意图判定与技能拦截，提取核心 PPT 主题 | `detectedIntent` |
| `S1_query_rewrite_search1` | **S1** | `intent_matched` | 并行发起 Query 结构化改写与初次宽泛检索 | `knowledgeBase` (初版) |
| `S1_agent_loop1_clarify` | **S1** | `auto` | 构建结构化需求澄清表单与多选项 | 待确认参数配置 |
| `S1_hitl_clarify_wait` | **S1** | `auto` | 挂起等待用户在 UI 界面提交表单 | 用户输入的页数/风格/受众 |
| `S1_search2_precise_rerank` | **S1** | `hitl_clarify_submit` | 基于明确参数执行精准二次检索与知识重排 | 精确知识库快照 |
| `S2_agent_loop2_plan` | **S2** | `auto` | 执行 Plan-and-Solve 生成 5 大模块层次化大纲 | 层次化 Markdown 大纲 |
| `S2_template_match` | **S2** | `auto` | 智能评分并匹配推荐演示文稿视觉模板 | 模板卡片与配色方案 |
| `S2_hitl_plan_template_wait` | **S2** | `auto` | 挂起等待用户在大纲/模板双预览弹窗中审批 | 审批通过与模板选定 |
| `S3_leader_dispatch` | **S3** | `hitl_plan_approve` | Leader Agent 按照 Section 拆包并初始化任务池 | 子任务列表 (Tasks) |
| `S3_subagent_executing` | **S3** | `auto` | 多个 Sub-Agents 并发独立渲染各模块 PPT 页面 | 各模块 SVG/DrawingML 产物 |
| `S3_review_subagent_checking`| **S3** | `auto` | Review Agent 启动四维独立质检与自动化打分 | 结构化质检报告 |
| `S3_review_rework` | **S3** | `review_rework` | 质检失败时定位缺陷模块，触发打回重做回路 | 重做任务队列 |
| `S3_merge_export` | **S3** | `review_pass` | 质检通过，合并全量页面并调用 PPTX 编译器 | 原生 `.pptx` 文件落盘 |
| `done` | **End** | `auto` | 全流程顺利完结，推送下载链接与完工事件 | 最终交付状态 |

---

## 📂 模块划分与工程目录树

```text
advanced-ppt-agent/
├── docs/                                # 🎓 全套源码级架构教学与面试通关指南
│   └── tutorial/
│       ├── 00_GLOBAL_ARCHITECTURE.md    # 模块00: 全局架构与 14 阶段有限状态机
│       ├── 01_S0_INTENT_ROUTING.md      # 模块01: 意图识别与技能路由
│       ├── 02_S1_ADAPTIVE_SEARCH...md   # 模块02: 自适应检索与需求澄清表单
│       ├── 03_S2_HIERARCHICAL_PLAN...md # 模块03: 层次化大纲规划与模板解耦
│       ├── 04_S3_LEADER_AND_SUBAGENT... # 模块04: Leader-Worker 模块化并发生成
│       ├── 05_S3_REVIEW_AGENT_4D...md   # 模块05: Review Agent 四维质检自省闭环
│       ├── 06_INTERVIEW_MASTER...md     # 模块06: 架构师级面试通关宝典与 Q&A
│       └── README.md                    # 教程全集导航索引
├── server/                              # 🖥️ 服务端核心逻辑 (Node.js + TypeScript)
│   ├── src/
│   │   ├── agents/                      # 智能体核心实现
│   │   │   ├── intent-router.ts         # S0: 意图路由智能体
│   │   │   ├── clarification-agent.ts   # S1: 需求澄清与检索智能体
│   │   │   ├── plan-strategist.ts       # S2: 大纲规划专家智能体
│   │   │   ├── template-matcher.ts      # S2: 模板智能匹配引擎
│   │   │   ├── leader-agent.ts          # S3: 任务拆解与分发 Leader
│   │   │   ├── worker-agent.ts          # S3: 页面渲染 Worker Sub-Agent
│   │   │   └── review-agent.ts          # S3: 四维质检与自省 Reviewer
│   │   ├── api/
│   │   │   └── routes.ts                # RESTful 交互路由
│   │   ├── core/                        # 状态机与核心类型
│   │   │   ├── backoff.ts               # 指数退避与 Full Jitter 重试算法
│   │   │   ├── state-machine.ts         # 14 阶段显式有限状态机核心
│   │   │   └── types.ts                 # 全链路 TypeScript 类型定义
│   │   ├── examples/
│   │   │   └── demo-full-pipeline.ts    # 终端端到端完整链路演示脚本
│   │   ├── scripts/
│   │   │   └── pptx_compiler.py         # Python 原生 PPTX 编译导出脚本
│   │   ├── sse/
│   │   │   └── event-bus.ts             # RingBuffer + Last-Event-ID 广播总线
│   │   ├── tools/
│   │   │   ├── pptx-exporter.ts         # PPTX 导出工具
│   │   │   └── web-search.ts            # 联网检索与 Rerank 工具
│   │   ├── workflow/
│   │   │   ├── checkpoint.ts            # queryID 原子落盘与崩溃恢复管理器
│   │   │   └── runner.ts                # 全链路工作流驱动器
│   │   └── index.ts                     # Express 后端主入口
│   └── test/
│       └── full-pipeline.test.ts        # Vitest 自动化单元与集成测试套件
├── web/                                 # 📱 现代化响应式前端 (Vue 3 + Tailwind CSS)
│   └── src/
│       ├── components/
│       │   ├── ClarificationForm.vue    # S1 阶段需求澄清表单交互组件
│       │   ├── MobileSimulator.vue      # 手机端交互模拟器框架
│       │   ├── PlanApprovalModal.vue    # S2 阶段大纲与模板双预览审批弹窗
│       │   ├── RAGKnowledgeList.vue     # 检索知识库动态展示面板
│       │   ├── ReviewDashboard.vue      # S3 四维质检雷达仪表盘
│       │   ├── StageProgress.vue        # 14 阶段流水线动态流转指示器
│       │   └── WebSearchResults.vue     # 搜索结果流式展示卡片
│       ├── composables/
│       │   └── useSSE.ts                # SSE 客户端驱动 (支持断线自动续传)
│       ├── App.vue                      # 前端主视图
│       └── main.ts                      # Vue 入口
├── package.json                         # 项目脚本与依赖定义
├── tsconfig.json                        # 根 TypeScript 配置
├── tsconfig.server.json                 # 服务端 TypeScript 配置
├── tsconfig.web.json                    # 前端 TypeScript 配置
└── vite.config.ts                       # Vite 构建与开发服务器配置
```

---

## 🚀 快速启动与演示

### 1. 环境准备
- **Node.js**: $\ge 20.0.0$
- **Python**: $\ge 3.9$ (用于 Python PPTX 编译器，需安装 `python-pptx`)

```bash
# 安装 Python 依赖 (可选，若需调用 Python 编译器)
pip3 install python-pptx
```

### 2. 安装项目依赖

```bash
# 根目录下安装所有依赖 (包含前后端)
npm install
```

### 3. 运行自动化测试套件 (Vitest)

```bash
npm run test
```

### 4. 运行终端端到端全链路演示 (CLI Demo)

无需启动浏览器，通过终端直观体验 S0 到 S3 的全链路状态跃迁、HITL 自动审批、四维质检与 PPTX 导出：

```bash
npm run demo
```

### 5. 启动前后端全栈开发环境

同时启动后端 API (端口 3000) 与 Vite 前端热更新服务 (端口 5188)：

```bash
npm run dev
```

启动成功后：
- 📱 **前端界面**：打开浏览器访问 [http://localhost:5188](http://localhost:5188)
- 🔌 **后端 API**：[http://localhost:3000](http://localhost:3000)

---

## 📡 SSE 流式通信与断线重连规范

客户端与服务端通过标准 SSE（Server-Sent Events）建立单向长连接通道：

```http
GET /api/workflow/stream/:queryId HTTP/1.1
Host: localhost:3000
Accept: text/event-stream
Last-Event-ID: 104
```

### 核心事件类型清单：

| 事件名 (Event) | 数据结构说明 | 前端响应动作 |
| :--- | :--- | :--- |
| `stage.enter` | `{ state: string, prev: string, reason: string, seq: number }` | 推进阶段进度条高亮 |
| `agent.log` | `{ agent: string, message: string, timestamp: number }` | 实时输出控制台日志 |
| `hitl.ask_clarify` | `{ prompt: string, schema: ClarificationSchema }` | 弹出 S1 需求澄清表单 |
| `hitl.ask_plan_template`| `{ plan: HierarchicalPlan, templates: Template[] }` | 弹出 S2 大纲与模板双审批弹窗 |
| `subagent.progress` | `{ taskId: string, sectionTitle: string, status: string }` | 展示子智能体并发进度 |
| `review.report` | `{ passed: boolean, dimensions: Review4DReport }` | 刷新四维质检仪表盘与缺陷列表 |
| `export.ready` | `{ downloadUrl: string, totalPages: number }` | 渲染 PPT 下载与在线预览入口 |
| `done` | `{ queryId: string, durationMs: number }` | 标记工作流顺利完结 |

---

## 🎓 全套源码级教程与面试指南

本项目在 [`docs/tutorial/`](./docs/tutorial/) 目录下提供了详尽的源码解析与大厂技术面试通关文档：

- 📘 [**模块 00：全局架构与 14 阶段状态机全景篇**](./docs/tutorial/00_GLOBAL_ARCHITECTURE.md)  
  *深入剖析有限状态机、RingBuffer 事件广播与原子落盘恢复机制。*
- 📘 [**模块 01：阶段 0 意图识别与技能路由篇**](./docs/tutorial/01_S0_INTENT_ROUTING.md)  
  *多意图精准拦截、`@PPT` 显式指令与自然语言特征抽取。*
- 📘 [**模块 02：阶段 1 自适应检索与需求对齐篇**](./docs/tutorial/02_S1_ADAPTIVE_SEARCH_AND_CLARIFICATION.md)  
  *Query 结构化重写、Agent Loop 1 澄清表单与精准 Rerank 机制。*
- 📘 [**模块 03：阶段 2 层次化大纲与模板解耦篇**](./docs/tutorial/03_S2_HIERARCHICAL_PLAN_AND_TEMPLATE.md)  
  *5 大业务模块大纲规划、视觉配色映射与 HITL 双预览审批门禁。*
- 📘 [**模块 04：阶段 3 Leader-Worker 模块化并发生成篇**](./docs/tutorial/04_S3_LEADER_AND_SUBAGENT_DISTRIBUTED.md)  
  *Leader 模块级拆包派发、Sub-Agents 上下文隔离与独立渲染。*
- 📘 [**模块 05：阶段 3 Review Agent 四维质检与自省修复篇**](./docs/tutorial/05_S3_REVIEW_AGENT_4D_QUALITY_LOOP.md)  
  *语法/排版溢出/大纲/诉求四维核验、autoFix 原地自省补丁与打回重做。*
- 🏆 [**模块 06：面试终极通关宝典与架构师级 Q&A**](./docs/tutorial/06_INTERVIEW_MASTER_CHEATSHEET.md)  
  *1 分钟开场话术、简历核心技术亮点包装、高频刁钻追问与满分回答模板。*

---

## 💻 技术栈一览

- **Core & Runtime**: Node.js, TypeScript 5.6
- **Server Framework**: Express 4, SSE (Server-Sent Events)
- **Frontend Framework**: Vue 3.5 (Composition API, `<script setup>`), Vite 5
- **Document & Presentation**: PptxGenJS, Python `python-pptx`, Marked, Mammoth
- **Testing & Tooling**: Vitest, tsx, Concurrently, Zod

---

## 🤝 贡献与反馈

欢迎提交 Issue 和 Pull Request 来完善本项目！

1. Fork 本项目仓库
2. 创建您的分支 (`git checkout -b feat/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送分支 (`git push origin feat/AmazingFeature`)
5. 新建 Pull Request

---

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 协议开源。
