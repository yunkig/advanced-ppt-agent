# PPT Agent Pro · 工业级全链路 AIGC 演示系统

> 本项目完整复现并落地了 **S0 意图识别与路由 $\rightarrow$ S1 WebSearch 联网检索与需求对齐 $\rightarrow$ S2 Plan-and-Solve 大纲规划与模板映射 $\rightarrow$ S3 Leader-Worker 分布式生成与 Review Agent 四维质检闭环** 的工业级 PPT Agent 架构。

---

## 🌟 核心全链路流程图 (S0 ~ S3)

```mermaid
flowchart TD
    subgraph S0 [阶段 0：意图识别与路由]
        U[用户输入 Prompt / @PPT 工具] --> IntentLLM[意图判定 LLM]
        IntentLLM -->|命中 PPT 意图| Route[进入 PPT 生成分支]
    end

    subgraph S1 [阶段 1：需求对齐与自适应检索]
        Route --> ParallelStart{并行执行}
        ParallelStart --> Rewrite[大模型 Query 结构化重写]
        ParallelStart --> Search1[初次 WebSearch 宽泛联网检索]
        Rewrite --> Loop1[Agent Loop 1: 需求澄清]
        Search1 --> Loop1
        Loop1 --> ToolAsk1[Tool: Ask user question<br/>前端表单：页数/风格/目标受众]
        ToolAsk1 --> UserFeedback1[用户回填参数]
        UserFeedback1 --> Search2[二次精准 WebSearch 检索 & 知识重排]
    end

    subgraph S2 [阶段 2：大纲规划与模板映射]
        Search2 --> Loop2[Agent Loop 2: Plan & Solve]
        Loop2 --> PlanGen[生成结构化 PPT 大纲 & 页面上下文 Plan]
        PlanGen --> TemplateMatch[智能推荐匹配风格模板]
        TemplateMatch --> ToolAsk2[Tool: Ask user question<br/>大纲确认 & 模板可视化卡片选择]
        ToolAsk2 --> UserFeedback2[用户确认大纲与模板]
    end

    subgraph S3 [阶段 3：分布式生成与多模态质检合并]
        UserFeedback2 --> Leader[Leader Agent: 任务拆解与分发]
        Leader --> Worker1[Sub-Agent 1: 页面 1~N 生成]
        Leader --> Worker2[Sub-Agent 2: 页面 N+1~M 生成]
        Leader --> WorkerK[Sub-Agent K: ...]
        
        Worker1 & Worker2 & WorkerK --> Review[Review Agent: 四维质检]
        
        subgraph ReviewChecks [质检核心维度]
            C1[1. 语法与表述校验]
            C2[2. 视觉多模态校验<br/>排版错位/文字溢出/缺页]
            C3[3. Plan 大纲结构符合度]
            C4[4. 用户原始诉求吻合度]
        end
        
        Review --> ReviewChecks
        ReviewChecks -->|不达标| Leader
        ReviewChecks -->|全量达标| Merge[多页合并 & 最终 PPT 渲染导出]
    end

    Merge --> Finish([进入展示 / 交付环节])
```

---

## 🚀 模块与代码落点

| 阶段 | 核心机制 | 代码落点 |
| :--- | :--- | :--- |
| **阶段 0** | **意图识别与路由**：判定 `@PPT` 工具与自然语言生成意图 | `server/src/agents/intent-router.ts` |
| **阶段 1** | **WebSearch 联网检索**：初次宽泛检索 + 二次精准 Rerank<br/>**Agent Loop 1**：Query 结构化重写 + `Ask user question` 表单 | `server/src/tools/web-search.ts`<br/>`server/src/agents/clarification-agent.ts`<br/>`web/src/components/ClarificationForm.vue` |
| **阶段 2** | **Plan & Solve 大纲规划**：页面级结构化 Plan 生成<br/>**模板映射**：智能匹配调色板与视觉规范<br/>**HITL 审批**：大纲与模板卡片双预览交互 | `server/src/agents/plan-strategist.ts`<br/>`server/src/agents/template-matcher.ts`<br/>`web/src/components/PlanApprovalModal.vue` |
| **阶段 3** | **Leader-Worker 拓扑**：大纲拆解为 SubTask 并发分发<br/>**Sub-Agent 渲染**：独立生成高质量 SVG 页面<br/>**Review Agent 四维质检**：语法、视觉排版、Plan符合度、诉求吻合度<br/>**自省修复回路**：`autoFix` 局部补丁与打回重做 | `server/src/agents/leader-agent.ts`<br/>`server/src/agents/worker-agent.ts`<br/>`server/src/agents/review-agent.ts`<br/>`web/src/components/ReviewDashboard.vue` |
| **底层通信** | **14 阶段有限状态机 + SSE 实时流 + queryID 检查点** | `server/src/core/state-machine.ts`<br/>`server/src/sse/event-bus.ts`<br/>`server/src/workflow/checkpoint.ts` |

---

## 🛠️ 快速启动与演示

```bash
# 1. 进入项目目录
cd advanced-ppt-agent

# 2. 安装依赖
npm install

# 3. 运行单元测试
npm run test

# 4. 运行终端端到端完整链路演示
npm run demo

# 5. 启动 Web 全栈双端开发服务 (localhost:5188)
npm run dev
```
