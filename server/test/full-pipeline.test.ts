import { describe, it, expect } from 'vitest';
import { IntentRouterAgent } from '../src/agents/intent-router.js';
import { WebSearchTool } from '../src/tools/web-search.js';
import { PlanStrategistAgent } from '../src/agents/plan-strategist.js';
import { TemplateMatcherAgent } from '../src/agents/template-matcher.js';
import { LeaderAgent } from '../src/agents/leader-agent.js';
import { WorkerAgent } from '../src/agents/worker-agent.js';
import { ReviewAgent } from '../src/agents/review-agent.js';
import { AdvancedStateMachine } from '../src/core/state-machine.js';

describe('PPT Agent Pro 全链路模块单元测试', () => {
  it('S0: 意图判定命中 @PPT 与自然语言', async () => {
    const router = new IntentRouterAgent();
    
    const res1 = await router.classify('@PPT 2026年企业级白皮书');
    expect(res1.isPPTIntent).toBe(true);
    expect(res1.triggerType).toBe('mention_tool');

    const res2 = await router.classify('帮我做一份关于年度总结的汇报PPT');
    expect(res2.isPPTIntent).toBe(true);
    expect(res2.confidence).toBeGreaterThan(0.9);
  });

  it('S1: WebSearch 联网检索工具宽泛与精准检索', async () => {
    const searchTool = new WebSearchTool();
    
    const broad = await searchTool.searchBroad('架构设计与技术落地');
    expect(broad.length).toBeGreaterThan(0);
    expect(broad[0].score).toBeGreaterThan(0);
    expect(broad[0].sourceDomain).toBeDefined();

    const precise = await searchTool.searchPrecise('年终述职', {
      pageCount: 10,
      style: '科技深邃蓝',
      targetAudience: '公司管理层',
      extraNotes: '突出交付指标'
    });
    expect(precise.length).toBeGreaterThan(0);
  });

  it('S2: Plan & Solve 层次化大纲规划 (5个大模块 + 1.1/1.2等子分块)', async () => {
    const strategist = new PlanStrategistAgent();
    const matcher = new TemplateMatcherAgent();

    const plan = await strategist.generatePlan('业务年度述职', {
      requestId: 'req-1',
      pageCount: 10,
      style: '科技深邃蓝',
      targetAudience: '公司管理层'
    }, []);

    // 验证层次化结构：5个核心大板块
    expect(plan.sections.length).toBe(5);
    expect(plan.sections[0].subSections.length).toBeGreaterThanOrEqual(2);
    expect(plan.sections[0].subSections[0].subId).toBe('1.1');
    expect(plan.sections[0].subSections[1].subId).toBe('1.2');
    expect(plan.markdownOutline).toContain('## 01 · 业务背景与行业现状洞察');
    expect(plan.markdownOutline).toContain('- **[1.1]');

    const templates = await matcher.matchTemplates(plan, '科技深邃蓝');
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].palette.primary).toBeDefined();
  });

  it('S3: Leader 模块级分发、Sub-Agent 生成 1.x 分块与 Review 产物质检', async () => {
    const leader = new LeaderAgent();
    const worker = new WorkerAgent();
    const review = new ReviewAgent();

    const strategist = new PlanStrategistAgent();
    const matcher = new TemplateMatcherAgent();
    const plan = await strategist.generatePlan('AIGC 技术白皮书', {
      requestId: 'req-1',
      pageCount: 10,
      style: '科技深邃蓝',
      targetAudience: '架构师'
    }, []);
    const templates = await matcher.matchTemplates(plan, '科技深邃蓝');

    // Leader 将 5 个 Section 派发给 5 个 Sub-Agent
    const packages = leader.dispatchSectionsToSubAgents(plan, templates[0]);
    expect(packages.length).toBe(5);
    expect(packages[0].assignedSection.sectionCode).toBe('SEC-01');

    // Sub-Agent 1 执行 Section 1 生成 (封面 + 1.1 + 1.2 = 3 页)
    packages[0].generatedSlides = await worker.executeSectionPackage(packages[0], 1);
    expect(packages[0].generatedSlides.length).toBe(3);
    expect(packages[0].generatedSlides[1].subId).toBe('1.1');

    // Review Agent 针对 Sub-Agent 1 负责的 Section 整体产物进行四维质检
    const report = await review.reviewSubAgentSectionPackage(packages[0], plan, {
      requestId: 'req-1',
      pageCount: 10,
      style: '科技深邃蓝',
      targetAudience: '架构师'
    });

    expect(report.subAgentId).toBe('Sub-Agent-1');
    expect(report.passed).toBe(true);
    expect(report.scores.syntaxScore).toBeGreaterThanOrEqual(70);
    expect(report.scores.visualScore).toBeGreaterThanOrEqual(70);
    expect(report.scores.planAlignmentScore).toBeGreaterThanOrEqual(70);
    expect(report.scores.intentAlignmentScore).toBeGreaterThanOrEqual(70);
  });

  it('状态机: 严格限制状态流转合法性', async () => {
    const sm = new AdvancedStateMachine('S0_intent_routing');
    expect(sm.canTransition('S1_query_rewrite_search1', 'intent_matched')).toBe(true);
    expect(sm.canTransition('done', 'auto')).toBe(false);

    await sm.transition('S1_query_rewrite_search1', 'intent_matched');
    expect(sm.state).toBe('S1_query_rewrite_search1');
  });
});
