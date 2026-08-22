/**
 * 核心领域模型与全链路类型定义
 * 升级为：两级层次化大纲 (Markdown 章节分块 1.1, 1.2, 2.1...) + Sub-Agent 模块级分发 + Review 模块产物质检
 */

export type QueryID = string & { readonly __brand: unique symbol };
export function asQueryID(id: string): QueryID {
  return id as QueryID;
}

export type WorkflowStage =
  | 'S0_intent_routing'
  | 'S1_query_rewrite_search1'
  | 'S1_agent_loop1_clarify'
  | 'S1_hitl_clarify_wait'
  | 'S1_search2_precise_rerank'
  | 'S2_agent_loop2_plan'
  | 'S2_template_match'
  | 'S2_hitl_plan_template_wait'
  | 'S3_leader_dispatch'
  | 'S3_subagent_executing'
  | 'S3_review_subagent_checking'
  | 'S3_review_rework'
  | 'S3_merge_export'
  | 'done'
  | 'failed';

/** 阶段 0: 意图判定 */
export interface IntentClassification {
  isPPTIntent: boolean;
  topic: string;
  confidence: number;
  triggerType: 'mention_tool' | 'natural_language' | 'none';
  reason: string;
}

/** WebSearch 联网检索结果项 */
export interface WebSearchItem {
  id: string;
  title: string;
  url: string;
  sourceDomain: string;
  snippet: string;
  score: number;
}

/** 阶段 1: 需求澄清表单 (Tool: Ask user question) */
export interface ClarificationQuestionnaire {
  requestId: string;
  rewrittenTopic: string;
  suggestedPageCount: number;
  availableStyles: string[];
  suggestedAudience: string[];
  broadSearchResults: WebSearchItem[]; // 并行初次检索召回的知识结果
  suggestedTopics: string[];           // 基于初次检索提炼的核心关注方向
  customQuestions: Array<{
    id: string;
    label: string;
    type: 'select' | 'input' | 'number';
    options?: string[];
    defaultValue: string | number;
  }>;
}

/** 用户回填参数 */
export interface ClarificationAnswers {
  requestId: string;
  pageCount: number;
  style: string;
  targetAudience: string;
  keyEmphases?: string[];
  extraNotes?: string;
}

// ----------------------------------------------------
// 阶段 2: 层次化 Markdown 大纲数据结构 (Hierarchical Outline)
// ----------------------------------------------------

/** 二级页面子主题 / 子分块 (如 1.1, 1.2, 2.1 等) */
export interface OutlineSubSection {
  subId: string;       // "1.1", "1.2", "2.1"
  title: string;       // 子分块标题
  pageType: 'content' | 'chart' | 'summary';
  bulletPoints: string[]; // 核心论点要点
  suggestedVisual: string; // 视觉与版式建议
  chartData?: {
    type: 'bar' | 'line' | 'pie';
    title: string;
    series: Array<{ name: string; value: number }>;
  };
}

/** 一级核心板块 / 章节 (如 "01 · 业务背景与现状洞察") */
export interface OutlineSection {
  sectionId: number;   // 1, 2, 3, 4, 5
  sectionCode: string; // "SEC-01", "SEC-02"
  title: string;       // 一级大模块名称
  summary: string;     // 该模块的核心定位与目标
  subSections: OutlineSubSection[]; // 对应的 1.1, 1.2, 1.3 子分块
}

/** 完整的结构化两级 Plan */
export interface HierarchicalPlan {
  title: string;
  themeStyle: string;
  targetAudience: string;
  totalSlides: number;
  markdownOutline: string; // Markdown 格式的完整大纲文本
  sections: OutlineSection[]; // 5 个左右的核心一级大模块
}

/** 模板卡片 */
export interface TemplateCard {
  id: string;
  name: string;
  styleName: string;
  coverPreviewUrl: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fontFamily: string;
  suitedScenarios: string[];
  description: string;
}

/** 阶段 2 用户审批回填 */
export interface PlanTemplateDecision {
  requestId: string;
  action: 'approve_all' | 'modify_plan' | 'regenerate_plan' | 'change_template' | 'reject';
  selectedTemplateId?: string;
  modifiedPlan?: HierarchicalPlan; // 用户在线编辑后的完整大纲
  feedbackComment?: string;
}

// ----------------------------------------------------
// 阶段 3: Sub-Agent 模块级任务包与 Review 产物质检
// ----------------------------------------------------

/** 单页生成结果 */
export interface SlideResult {
  pageIdx: number;
  sectionCode: string;
  subId: string;
  title: string;
  svgContent: string;
}

/**
 * 阶段 3: Sub-Agent 模块级任务包 (Sub-Agent Task Package)
 * Input 为 1 个（或一组）完整的一级大模块及其内部的 1.1, 1.2 等子分块
 */
export interface SubAgentPackage {
  subAgentId: string;
  role: string;
  assignedSection: OutlineSection; // 输入的核心大模块
  includeCover?: boolean;          // 是否包含封面
  includeEnding?: boolean;         // 是否包含封底
  template: TemplateCard;
  status: 'pending' | 'generating' | 'completed' | 'reworking' | 'failed';
  generatedSlides: SlideResult[];
  error?: string;
}

/** Review 质检明细 */
export interface ReviewIssue {
  dimension: 'syntax' | 'multimodal_visual' | 'plan_alignment' | 'intent_alignment';
  severity: 'critical' | 'warning' | 'info';
  pageIdx?: number;
  message: string;
  autoFixApplied?: boolean;
}

/** Review Agent 对某一个 Sub-Agent 交付的模块成果包的四维质检报告 */
export interface SubAgentReviewReport {
  subAgentId: string;
  sectionTitle: string;
  generatedPagesCount: number;
  passed: boolean;
  scores: {
    syntaxScore: number;          // 维度1: 语法与表述 (0-100)
    visualScore: number;          // 维度2: 视觉多模态校验 (排版溢出/错位/缺页/连续性) (0-100)
    planAlignmentScore: number;   // 维度3: Plan 大纲结构符合度 (0-100)
    intentAlignmentScore: number; // 维度4: 用户原始诉求吻合度 (0-100)
  };
  issues: ReviewIssue[];
  reworkRequired: boolean;
}

/** 全量运行时状态快照 */
export interface WorkflowState {
  queryID: QueryID;
  stage: WorkflowStage;
  enteredAt: number;
  seq: number;
  userPrompt: string;
  
  // S0
  intent?: IntentClassification;
  
  // S1
  rewrittenQuery?: string;
  search1BroadResults?: WebSearchItem[];
  clarificationQuestionnaire?: ClarificationQuestionnaire;
  clarificationAnswers?: ClarificationAnswers;
  search2PreciseResults?: WebSearchItem[];
  
  // S2
  plan?: HierarchicalPlan;
  recommendedTemplates?: TemplateCard[];
  selectedTemplate?: TemplateCard;
  
  // S3 (Leader-Worker-Review 拓扑)
  subAgentPackages: SubAgentPackage[];
  subAgentReviews: SubAgentReviewReport[];
  reworkCount: number;
  mergedPptxPath?: string;
  
  lastError?: {
    message: string;
    at: number;
  };
}
