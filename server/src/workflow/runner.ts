/**
 * WorkflowRunner: 全生命周期工作流调度器
 * 编排 S0 -> S1 (WebSearch) -> S2 (大纲规划、在线编辑与重新构思循环) -> S3 (Leader分发大模块 -> Sub-Agent生成1.x分块 -> Review质检 -> Merge) -> Done
 */

import { randomUUID } from 'node:crypto';
import {
  asQueryID,
  type QueryID,
  type WorkflowState,
  type ClarificationAnswers,
  type PlanTemplateDecision
} from '../core/types.js';
import { AdvancedStateMachine } from '../core/state-machine.js';
import { writeCheckpoint, readCheckpoint } from './checkpoint.js';
import { getGlobalEventBus } from '../sse/event-bus.js';

import { IntentRouterAgent } from '../agents/intent-router.js';
import { ClarificationAgent } from '../agents/clarification-agent.js';
import { WebSearchTool } from '../tools/web-search.js';
import { PlanStrategistAgent } from '../agents/plan-strategist.js';
import { TemplateMatcherAgent } from '../agents/template-matcher.js';
import { LeaderAgent } from '../agents/leader-agent.js';
import { WorkerAgent } from '../agents/worker-agent.js';
import { ReviewAgent } from '../agents/review-agent.js';
import { PPTXExporter } from '../tools/pptx-exporter.js';

export class WorkflowRunner {
  private readonly bus = getGlobalEventBus();
  private readonly intentRouter = new IntentRouterAgent();
  private readonly clarificationAgent = new ClarificationAgent();
  private readonly webSearchTool = new WebSearchTool();
  private readonly planStrategist = new PlanStrategistAgent();
  private readonly templateMatcher = new TemplateMatcherAgent();
  private readonly leaderAgent = new LeaderAgent();
  private readonly workerAgent = new WorkerAgent();
  private readonly reviewAgent = new ReviewAgent();
  private readonly pptxExporter = new PPTXExporter();

  // 阻塞式 HITL Promise Resolvers
  private pendingClarifyResolvers = new Map<string, (answers: ClarificationAnswers) => void>();
  private pendingPlanResolvers = new Map<string, (decision: PlanTemplateDecision) => void>();

  /**
   * 启动全新的 PPT 生成任务
   */
  async start(rawPrompt: string): Promise<WorkflowState> {
    const queryID = asQueryID(randomUUID());
    const state: WorkflowState = {
      queryID,
      stage: 'S0_intent_routing',
      enteredAt: Date.now(),
      seq: 0,
      userPrompt: rawPrompt,
      subAgentPackages: [],
      subAgentReviews: [],
      reworkCount: 0
    };

    // 异步执行主流程，不阻塞首次接口响应
    this.executeWorkflow(state).catch(err => {
      console.error(`[Workflow ${queryID}] Execution failed:`, err);
    });

    return state;
  }

  /**
   * 提交阶段 1 的需求澄清答案 (Tool: Ask user question 回填)
   */
  submitClarification(queryID: string, answers: ClarificationAnswers): boolean {
    const resolver = this.pendingClarifyResolvers.get(queryID);
    if (resolver) {
      resolver(answers);
      this.pendingClarifyResolvers.delete(queryID);
      return true;
    }
    return false;
  }

  /**
   * 提交阶段 2 的大纲与模板审批决定
   */
  submitPlanDecision(queryID: string, decision: PlanTemplateDecision): boolean {
    const resolver = this.pendingPlanResolvers.get(queryID);
    if (resolver) {
      resolver(decision);
      this.pendingPlanResolvers.delete(queryID);
      return true;
    }
    return false;
  }

  private async executeWorkflow(state: WorkflowState): Promise<void> {
    const sm = new AdvancedStateMachine(state.stage, {
      onEnter: async (to, prev, reason) => {
        state.stage = to;
        state.enteredAt = Date.now();
        state.seq += 1;
        await writeCheckpoint(state);
        this.bus.publish('stage.enter', {
          queryID: state.queryID,
          stage: to,
          prev,
          reason,
          seq: state.seq,
          state
        });
      }
    });

    try {
      // ----------------------------------------------------
      // 阶段 0: 意图识别与路由
      // ----------------------------------------------------
      this.bus.publish('agent.log', { queryID: state.queryID, message: '阶段 0：正在进行用户意图判定与技能路由...' });
      const intent = await this.intentRouter.classify(state.userPrompt);
      state.intent = intent;

      if (!intent.isPPTIntent) {
        state.lastError = { message: intent.reason, at: Date.now() };
        await sm.transition('failed', 'intent_rejected');
        return;
      }
      await sm.transition('S1_query_rewrite_search1', 'intent_matched');

      // ----------------------------------------------------
      // 阶段 1: 需求对齐与自适应 WebSearch 检索 (S1)
      // ----------------------------------------------------
      this.bus.publish('agent.log', { queryID: state.queryID, message: '阶段 1：并行执行 Query 结构化重写与初次 WebSearch 宽泛联网检索...' });
      
      const [rewrittenQuery, search1Results] = await Promise.all([
        this.clarificationAgent.rewriteQuery(state.userPrompt, intent.topic),
        this.webSearchTool.searchBroad(intent.topic)
      ]);
      state.rewrittenQuery = rewrittenQuery;
      state.search1BroadResults = search1Results;

      // 进入 Agent Loop 1: 生成提问表单 (Tool: Ask user question)
      await sm.transition('S1_agent_loop1_clarify', 'auto');
      const questionnaire = await this.clarificationAgent.generateClarificationTool(
        state.queryID,
        intent.topic,
        rewrittenQuery,
        search1Results
      );
      state.clarificationQuestionnaire = questionnaire;

      // 挂起等待用户回填
      await sm.transition('S1_hitl_clarify_wait', 'auto');
      this.bus.publish('hitl.clarify_requested', {
        queryID: state.queryID,
        questionnaire,
        search1BroadResults: search1Results,
        rewrittenQuery
      });

      const userAnswers = await new Promise<ClarificationAnswers>(resolve => {
        this.pendingClarifyResolvers.set(state.queryID, resolve);
      });
      state.clarificationAnswers = userAnswers;

      // 二次精准 WebSearch 检索 & 知识重排
      await sm.transition('S1_search2_precise_rerank', 'hitl_clarify_submit');
      this.bus.publish('agent.log', { queryID: state.queryID, message: '阶段 1：基于用户精准意图执行二次精准 WebSearch 检索与 Rerank...' });
      const search2Results = await this.webSearchTool.searchPrecise(intent.topic, userAnswers);
      state.search2PreciseResults = search2Results;

      // ----------------------------------------------------
      // 阶段 2: 层次化 Markdown 大纲规划与模板映射 (支持多次重新规划与用户在线编辑)
      // ----------------------------------------------------
      let planApproved = false;
      let planGenerationCount = 0;

      while (!planApproved) {
        planGenerationCount += 1;
        const isRegen = state.stage === 'S2_hitl_plan_template_wait';
        await sm.transition('S2_agent_loop2_plan', isRegen ? 'hitl_plan_modify' : 'auto');

        this.bus.publish('agent.log', {
          queryID: state.queryID,
          message: planGenerationCount > 1
            ? `阶段 2：正在为您重新构思并生成第 ${planGenerationCount} 版全新大纲...`
            : '阶段 2：Agent Loop 2 执行 Plan-and-Solve 生成 Markdown 层次化大纲 (5大模块 + 1.1/1.2分块)...'
        });

        const plan = await this.planStrategist.generatePlan(intent.topic, userAnswers, search2Results, planGenerationCount);
        state.plan = plan;

        // 模板匹配
        await sm.transition('S2_template_match', 'auto');
        this.bus.publish('agent.log', { queryID: state.queryID, message: '阶段 2：智能推荐匹配风格模板卡片...' });
        const recommendedTemplates = await this.templateMatcher.matchTemplates(plan, userAnswers.style);
        state.recommendedTemplates = recommendedTemplates;
        if (!state.selectedTemplate) {
          state.selectedTemplate = recommendedTemplates[0];
        }

        // 挂起等待大纲与模板 HITL 审批 (用户可确认、可在线编辑、也可点重新规划)
        await sm.transition('S2_hitl_plan_template_wait', 'auto');
        this.bus.publish('hitl.plan_template_requested', {
          queryID: state.queryID,
          plan,
          recommendedTemplates,
          defaultSelectedId: state.selectedTemplate?.id || recommendedTemplates[0]?.id
        });

        const planDecision = await new Promise<PlanTemplateDecision>(resolve => {
          this.pendingPlanResolvers.set(state.queryID, resolve);
        });

        if (planDecision.action === 'approve_all') {
          // 用户确认通过！如果用户在线修改了大纲，采用用户修改后的大纲！
          if (planDecision.modifiedPlan) {
            state.plan = planDecision.modifiedPlan;
          }
          if (planDecision.selectedTemplateId) {
            state.selectedTemplate = recommendedTemplates.find(t => t.id === planDecision.selectedTemplateId) || recommendedTemplates[0];
          }
          planApproved = true;
        } else if (planDecision.action === 'modify_plan' || planDecision.action === 'regenerate_plan') {
          // 用户请求重新规划！继续在 while 循环中流转回 S2_agent_loop2_plan 重新生成！
          this.bus.publish('agent.log', { queryID: state.queryID, message: '收到重新构思大纲请求，正在进入下一轮大纲规划...' });
        }
      }

      // ----------------------------------------------------
      // 阶段 3: Leader 模块级分发 -> Sub-Agent 生成 1.x -> Review 质检模块产物 (S3)
      // ----------------------------------------------------
      await sm.transition('S3_leader_dispatch', 'hitl_plan_approve');
      this.bus.publish('agent.log', { queryID: state.queryID, message: `阶段 3：Leader Agent 将大纲拆解为 ${state.plan!.sections.length} 个一级大模块 (Section) 并分发至各 Sub-Agent...` });

      const packages = this.leaderAgent.dispatchSectionsToSubAgents(state.plan!, state.selectedTemplate!);
      state.subAgentPackages = packages;

      // Sub-Agents 并发独立生成各自负责的大模块 (包含 1.1, 1.2 等分块)
      await sm.transition('S3_subagent_executing', 'auto');
      this.bus.publish('agent.log', { queryID: state.queryID, message: `阶段 3：${packages.length} 个 Sub-Agents 并发生成各自负责的大模块与 1.x 子分块页面...` });

      let startPageIdx = 1;
      for (const pkg of packages) {
        pkg.status = 'generating';
        pkg.generatedSlides = await this.workerAgent.executeSectionPackage(pkg, startPageIdx);
        startPageIdx += pkg.generatedSlides.length;
        pkg.status = 'completed';
      }

      // Review Agent 针对每一个 Sub-Agent 交付的整体大模块产物包进行四维质检
      await sm.transition('S3_review_subagent_checking', 'auto');
      this.bus.publish('agent.log', { queryID: state.queryID, message: '阶段 3：Review Agent 独立质检每一个 Sub-Agent 的大模块产物交付包...' });

      let reviewReports = await Promise.all(
        packages.map(pkg => this.reviewAgent.reviewSubAgentSectionPackage(pkg, state.plan!, state.clarificationAnswers!))
      );
      state.subAgentReviews = reviewReports;

      // 自省修复与打回重做回路
      const hasUnpassed = reviewReports.some(r => r.reworkRequired);
      if (hasUnpassed && state.reworkCount < 2) {
        state.reworkCount += 1;
        await sm.transition('S3_review_rework', 'review_rework');
        this.bus.publish('agent.log', { queryID: state.queryID, message: `阶段 3：检测到部分 Sub-Agent 模块未达标，触发 autoFix 原地修复与打回重做（第 ${state.reworkCount} 轮）...` });

        for (const pkg of packages) {
          const report = reviewReports.find(r => r.subAgentId === pkg.subAgentId);
          if (report && report.issues.length > 0) {
            this.reviewAgent.autoFixSectionPackage(pkg, report.issues);
          }
        }

        // 重新质检
        reviewReports = await Promise.all(
          packages.map(pkg => this.reviewAgent.reviewSubAgentSectionPackage(pkg, state.plan!, state.clarificationAnswers!))
        );
        state.subAgentReviews = reviewReports;
      }

      // 全量 Sub-Agent 达标，执行产物合并与 Python 原生 PPTX 编译导出
      await sm.transition('S3_merge_export', 'review_pass');
      this.bus.publish('agent.log', { queryID: state.queryID, message: '阶段 3：调用 Python PPTX 编译器生成原生 Office 二进制 .pptx 文件...' });

      state.mergedPptxPath = await this.pptxExporter.exportToPPTX(state);
      this.bus.publish('agent.log', { queryID: state.queryID, message: `阶段 3：原生 PPTX 文件已成功生成落盘: ${state.mergedPptxPath}` });

      await sm.transition('done', 'auto');
      this.bus.publish('run.end', {
        queryID: state.queryID,
        status: 'success',
        state
      });
    } catch (err: any) {
      state.lastError = {
        message: err.message || String(err),
        at: Date.now()
      };
      if (sm.canTransition('failed', 'fail')) {
        await sm.transition('failed', 'fail');
      }
      this.bus.publish('run.end', {
        queryID: state.queryID,
        status: 'failed',
        error: state.lastError
      });
    }
  }
}

let globalRunner: WorkflowRunner | null = null;
export function getWorkflowRunner(): WorkflowRunner {
  if (!globalRunner) {
    globalRunner = new WorkflowRunner();
  }
  return globalRunner;
}
