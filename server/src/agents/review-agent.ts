/**
 * S3: Review Agent 模块级四维质检与自省修复引擎
 * 针对每一个 Sub-Agent 生成交付的一级大模块 (Section 及其 1.1, 1.2 等子分块产物) 进行全面质检
 */

import type { SubAgentPackage, SubAgentReviewReport, ReviewIssue, HierarchicalPlan, ClarificationAnswers } from '../core/types.js';

export class ReviewAgent {
  /**
   * 对某一个 Sub-Agent 交付的大模块成果包进行四维综合质检
   */
  async reviewSubAgentSectionPackage(
    pkg: SubAgentPackage,
    globalPlan: HierarchicalPlan,
    userIntent: ClarificationAnswers
  ): Promise<SubAgentReviewReport> {
    const issues: ReviewIssue[] = [];
    const { subAgentId, assignedSection, generatedSlides } = pkg;

    let syntaxScore = 100;
    let visualScore = 100;
    let planScore = 100;
    let intentScore = 100;

    const expectedSlideCount = assignedSection.subSections.length + (pkg.includeCover ? 1 : 0);

    // 0. 完整度核验：检查该 Sub-Agent 是否漏掉了分配的 1.x 子分块
    if (!generatedSlides || generatedSlides.length !== expectedSlideCount) {
      issues.push({
        dimension: 'plan_alignment',
        severity: 'critical',
        message: `${subAgentId} 模块交付页数不匹配（应产出 ${expectedSlideCount} 页，实际交付 ${generatedSlides?.length || 0} 页）`
      });
      return {
        subAgentId,
        sectionTitle: assignedSection.title,
        generatedPagesCount: generatedSlides?.length || 0,
        passed: false,
        scores: { syntaxScore: 0, visualScore: 0, planAlignmentScore: 0, intentAlignmentScore: 0 },
        issues,
        reworkRequired: true
      };
    }

    // 逐页与跨页综合质检
    for (const slide of generatedSlides) {
      const svg = slide.svgContent;

      if (!svg || svg.length < 50) {
        issues.push({
          dimension: 'multimodal_visual',
          severity: 'critical',
          pageIdx: slide.pageIdx,
          message: `分块 [${slide.subId}] SVG 渲染内容为空`
        });
        continue;
      }

      // 1. 语法表述
      if (slide.title.length < 2) {
        syntaxScore -= 10;
        issues.push({
          dimension: 'syntax',
          severity: 'warning',
          pageIdx: slide.pageIdx,
          message: `分块 [${slide.subId}] 标题过短，表述不够详尽`
        });
      }

      // 2. 视觉排版与越界防溢出
      if (!svg.includes('<rect') || !svg.includes('fill=')) {
        visualScore -= 20;
        issues.push({
          dimension: 'multimodal_visual',
          severity: 'critical',
          pageIdx: slide.pageIdx,
          message: `分块 [${slide.subId}] 背景图层缺失 (bg-missing)`
        });
      }

      const xMatches = svg.match(/x="(\d+)"/g) || [];
      for (const xm of xMatches) {
        const val = parseInt(xm.replace(/[^0-9]/g, ''), 10);
        if (val > 1240) {
          visualScore -= 15;
          issues.push({
            dimension: 'multimodal_visual',
            severity: 'warning',
            pageIdx: slide.pageIdx,
            message: `分块 [${slide.subId}] 元素 X 坐标越界 (x=${val} > 1240)`
          });
          break;
        }
      }

      // 3. Plan 覆盖度：检查是否体现了所属 Section 的大标题或子分块编号
      if (!svg.includes(slide.subId) && slide.subId !== '0.0') {
        planScore -= 15;
        issues.push({
          dimension: 'plan_alignment',
          severity: 'warning',
          pageIdx: slide.pageIdx,
          message: `分块 [${slide.subId}] 未标注对应的章节子分块编号`
        });
      }

      // 4. 用户意图吻合度
      const templatePalette = pkg.template.palette;
      if (!svg.includes(templatePalette.primary) && !svg.includes(templatePalette.accent)) {
        intentScore -= 15;
        issues.push({
          dimension: 'intent_alignment',
          severity: 'warning',
          pageIdx: slide.pageIdx,
          message: `分块 [${slide.subId}] 未严格应用选定的「${userIntent.style}」主题色`
        });
      }
    }

    const avgScore = (syntaxScore + visualScore + planScore + intentScore) / 4;
    const hasCritical = issues.some(i => i.severity === 'critical');
    const passed = !hasCritical && avgScore >= 80;

    return {
      subAgentId,
      sectionTitle: assignedSection.title,
      generatedPagesCount: generatedSlides.length,
      passed,
      scores: {
        syntaxScore: Math.max(0, syntaxScore),
        visualScore: Math.max(0, visualScore),
        planAlignmentScore: Math.max(0, planScore),
        intentAlignmentScore: Math.max(0, intentScore)
      },
      issues,
      reworkRequired: !passed
    };
  }

  /**
   * 对 Sub-Agent 未达标的任务包执行局部 autoFix 原地修补
   */
  autoFixSectionPackage(pkg: SubAgentPackage, issues: ReviewIssue[]): void {
    for (const slide of pkg.generatedSlides) {
      let fixed = slide.svgContent;
      for (const issue of issues) {
        if (issue.pageIdx === slide.pageIdx || !issue.pageIdx) {
          if (issue.message.includes('bg-missing')) {
            fixed = fixed.replace('<svg', '<svg>\n<rect width="1280" height="720" fill="#0f172a" />');
            issue.autoFixApplied = true;
          }
          if (issue.message.includes('X 坐标越界')) {
            fixed = fixed.replace(/x="1[2-9]\d{2}"/g, 'x="1180"');
            issue.autoFixApplied = true;
          }
        }
      }
      slide.svgContent = fixed;
    }
  }
}
