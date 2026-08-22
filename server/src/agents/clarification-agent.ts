/**
 * S1: 需求对齐与澄清 Agent (Clarification Agent)
 * 负责大模型 Query 结构化重写 + 结合初次 WebSearch 宽泛检索结果生成 Tool: Ask user question 提问表单
 */

import type { WebSearchItem, ClarificationQuestionnaire } from '../core/types.js';

export class ClarificationAgent {
  /**
   * 并行步骤 1.1: 大模型 Query 结构化重写 (Query Rewrite)
   */
  async rewriteQuery(rawPrompt: string, topic: string): Promise<string> {
    if (topic.includes('总结') || topic.includes('述职')) {
      return `【结构化重写】针对主题「${topic}」，核心定位为企业年终述职与业务成果复盘。重点需涵盖业务指标增长、关键技术攻坚、问题反思与次年战略规划。`;
    }
    if (topic.includes('bp') || topic.includes('商业') || topic.includes('融资')) {
      return `【结构化重写】针对主题「${topic}」，核心定位为投资人商业路演 BP。重点需涵盖行业痛点、产品优势壁垒、商业模式、财务预测与团队背书。`;
    }
    return `【结构化重写】针对主题「${topic}」，构建面向专业受众的高质量演示文稿。突出核心论点、联网行业数据支撑、落地方法论与愿景展望。`;
  }

  /**
   * Agent Loop 1: 带着并行执行得到的初次 RAG/WebSearch 宽泛检索结果，向用户生成澄清表单 (Tool: Ask user question)
   */
  async generateClarificationTool(
    requestId: string,
    topic: string,
    rewrittenQuery: string,
    search1Results: WebSearchItem[]
  ): Promise<ClarificationQuestionnaire> {
    const webSources = search1Results.map(r => r.sourceDomain).join('、');
    
    // 基于初次检索到的行业资讯提炼出的核心热点子方向建议
    const suggestedTopics = search1Results.map(r => r.title.slice(0, 20)).slice(0, 3);

    return {
      requestId,
      rewrittenTopic: topic,
      suggestedPageCount: 8,
      availableStyles: [
        '科技深邃蓝 (Tech Navy)',
        '极简商务灰 (Minimalist Charcoal)',
        '活力创新橙 (Vibrant Orange)',
        '学术沉稳绿 (Academic Emerald)'
      ],
      suggestedAudience: [
        '公司管理层 / 业务总监',
        '投资人 / 投资机构',
        '技术研发团队 / 架构师',
        '行业客户 / 外部合作伙伴'
      ],
      broadSearchResults: search1Results,
      suggestedTopics,
      customQuestions: [
        {
          id: 'pageCount',
          label: '预估生成页数 (Slides Count)',
          type: 'number',
          defaultValue: 8
        },
        {
          id: 'style',
          label: '视觉与配色风格 (Visual Style)',
          type: 'select',
          options: [
            '科技深邃蓝 (Tech Navy)',
            '极简商务灰 (Minimalist Charcoal)',
            '活力创新橙 (Vibrant Orange)',
            '学术沉稳绿 (Academic Emerald)'
          ],
          defaultValue: '科技深邃蓝 (Tech Navy)'
        },
        {
          id: 'targetAudience',
          label: '核心目标受众 (Target Audience)',
          type: 'select',
          options: [
            '公司管理层 / 业务总监',
            '投资人 / 投资机构',
            '技术研发团队 / 架构师',
            '行业客户 / 外部合作伙伴'
          ],
          defaultValue: '公司管理层 / 业务总监'
        },
        {
          id: 'extraNotes',
          label: '补充特定重点或业务数据 (Key Points / Notes)',
          type: 'input',
          defaultValue: `参考联网行业资讯 (${webSources})...`
        }
      ]
    };
  }
}
