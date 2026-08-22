/**
 * S2: 模板智能推荐 Agent (Template Matcher)
 * 基于主题、风格与大纲结构，推荐最契合的视觉模板卡片
 */

import type { TemplateCard, HierarchicalPlan } from '../core/types.js';

export const TEMPLATE_PRESETS: TemplateCard[] = [
  {
    id: 'tpl-tech-deepblue',
    name: '星际深蓝 · 科技未来 (Tech Blue)',
    styleName: '科技深邃蓝',
    coverPreviewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    palette: {
      primary: '#0284c7',      // 天空蓝
      secondary: '#0369a1',    // 深湖蓝
      background: '#0f172a',   // 极夜蓝黑
      text: '#f8fafc',         // 纯净雪白
      accent: '#38bdf8'        // 极光青蓝
    },
    fontFamily: 'Inter, system-ui, sans-serif',
    suitedScenarios: ['技术架构汇报', '产品发布会', 'AIGC/AI 专题演讲'],
    description: '深邃高对比度背景，适合极客科技、系统架构、AI 大模型主题，视觉科技感极强。'
  },
  {
    id: 'tpl-minimal-charcoal',
    name: '雅致极简 · 商务炭灰 (Minimalist)',
    styleName: '极简商务灰',
    coverPreviewUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    palette: {
      primary: '#2563eb',      // 经典商务蓝
      secondary: '#475569',    // 高级石板灰
      background: '#ffffff',   // 纯白高亮
      text: '#0f172a',         // 墨黑正文
      accent: '#64748b'        // 中性灰辅色
    },
    fontFamily: 'system-ui, -apple-system, sans-serif',
    suitedScenarios: ['管理层述职', '战略规划', '季度财报总结'],
    description: '白底黑字高对比度、呼吸感留白，适合高层汇报与正式商业商务场景。'
  },
  {
    id: 'tpl-vibrant-orange',
    name: '朝阳破晓 · 创新活力 (Vibrant Orange)',
    styleName: '活力创新橙',
    coverPreviewUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
    palette: {
      primary: '#ea580c',      // 活力暖橙
      secondary: '#c2410c',    // 深烈橙
      background: '#18181b',   // 哑光暗黑
      text: '#fafafa',         // 暖白
      accent: '#f97316'        // 耀光橙
    },
    fontFamily: 'system-ui, sans-serif',
    suitedScenarios: ['商业计划书 (BP)', '路演融资', '营销增长提案'],
    description: '高饱和度暖色调，极具视觉冲击力与感染力，适合项目路演与创业招商。'
  },
  {
    id: 'tpl-academic-emerald',
    name: '松柏青翠 · 学术典雅 (Academic Emerald)',
    styleName: '学术沉稳绿',
    coverPreviewUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80',
    palette: {
      primary: '#059669',      // 翡翠绿
      secondary: '#047857',    // 墨玉绿
      background: '#f8fafc',   // 羊皮纸淡白
      text: '#1e293b',         // 典雅深蓝灰
      accent: '#10b981'        // 嫩芽青绿
    },
    fontFamily: 'Georgia, serif, system-ui',
    suitedScenarios: ['学术论文答辩', '行业研究白皮书', '教育培训课件'],
    description: '沉稳雅致的翠绿色调搭配衬线体，传递学术严谨与权威厚重感。'
  }
];

export class TemplateMatcherAgent {
  async matchTemplates(plan: HierarchicalPlan, preferredStyle: string): Promise<TemplateCard[]> {
    // 根据用户选择的偏好风格或大纲主题优先排序
    const sorted = [...TEMPLATE_PRESETS].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.styleName.includes(preferredStyle)) scoreA += 5;
      if (b.styleName.includes(preferredStyle)) scoreB += 5;

      if (plan.themeStyle.includes(a.styleName)) scoreA += 3;
      if (plan.themeStyle.includes(b.styleName)) scoreB += 3;

      return scoreB - scoreA;
    });

    return sorted;
  }
}
