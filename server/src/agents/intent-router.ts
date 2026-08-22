/**
 * S0: 意图识别与路由 Agent (IntentLLM & Router)
 * 判断输入是否命中 PPT 意图（支持 @PPT 工具 或 自然语言 Prompt 意图提取）
 */

import type { IntentClassification } from '../core/types.js';

export class IntentRouterAgent {
  async classify(input: string): Promise<IntentClassification> {
    const trimmed = input.trim();
    
    // 1. 显式命中 @PPT 工具
    if (trimmed.includes('@PPT') || trimmed.includes('@ppt') || trimmed.startsWith('/ppt')) {
      const topic = trimmed.replace(/@ppt/gi, '').replace(/\/ppt/gi, '').trim() || '通用演示汇报';
      return {
        isPPTIntent: true,
        topic,
        confidence: 0.99,
        triggerType: 'mention_tool',
        reason: '用户显式 @PPT 工具，强制路由到 PPT 生成分支'
      };
    }

    // 2. 自然语言特征词匹配
    const pptKeywords = ['ppt', '幻灯片', '演示文稿', 'slide', '汇报', '述职', '发布会', 'bp', '演讲', '讲稿', '分享'];
    const lower = trimmed.toLowerCase();
    const matched = pptKeywords.some(k => lower.includes(k));

    if (matched) {
      // 提取主题
      const topic = trimmed
        .replace(/帮我(制作|生成|写|准备|搞一份)?/g, '')
        .replace(/(一份|一个)?(关于)?/g, '')
        .replace(/(的)?(ppt|幻灯片|演示文稿|汇报)/gi, '')
        .trim() || trimmed;

      return {
        isPPTIntent: true,
        topic: topic || trimmed,
        confidence: 0.95,
        triggerType: 'natural_language',
        reason: `自然语言命中 PPT 意图关键词（${matched}），识别核心主题为「${topic}」`
      };
    }

    // 3. 兜底判定
    if (trimmed.length > 5 && !trimmed.startsWith('?')) {
      // 隐式推断
      return {
        isPPTIntent: true,
        topic: trimmed,
        confidence: 0.85,
        triggerType: 'natural_language',
        reason: `推断用户希望以「${trimmed}」为核心内容构建展示型演示文稿`
      };
    }

    return {
      isPPTIntent: false,
      topic: trimmed,
      confidence: 0.2,
      triggerType: 'none',
      reason: '未检测到 PPT 生成意图，维持常规对话'
    };
  }
}
