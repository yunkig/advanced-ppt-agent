/**
 * S3: Leader Agent 任务拆解与分发
 * 将层次化 Markdown 大纲按一级大模块 (Section) 拆解，将每个 Section (包含 1.1, 1.2...) 作为 Input 派发给特定的 Sub-Agent
 */

import type { HierarchicalPlan, TemplateCard, SubAgentPackage } from '../core/types.js';

export class LeaderAgent {
  /**
   * 模块化任务拆解与派发
   * 将大纲中的各个一级大模块 (Section) 映射为独立的 Sub-Agent 任务包
   */
  dispatchSectionsToSubAgents(plan: HierarchicalPlan, template: TemplateCard): SubAgentPackage[] {
    const packages: SubAgentPackage[] = [];

    plan.sections.forEach((section, idx) => {
      const subAgentId = `Sub-Agent-${idx + 1}`;
      const isFirst = idx === 0;
      const isLast = idx === plan.sections.length - 1;

      const subIds = section.subSections.map(s => s.subId).join(', ');
      const role = `${subAgentId}: 负责【${section.title}】模块（包含 ${subIds}）`;

      packages.push({
        subAgentId,
        role,
        assignedSection: section,
        includeCover: isFirst,
        includeEnding: isLast,
        template,
        status: 'pending',
        generatedSlides: []
      });
    });

    return packages;
  }
}
