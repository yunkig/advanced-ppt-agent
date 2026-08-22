/**
 * S3: Sub-Agent 模块级生成 Worker (Worker Agent)
 * 独立接收所属的 Section 大模块 (包含 1.1, 1.2 等子分块)，并渲染出该模块的全部高保真页面
 */

import type { SubAgentPackage, OutlineSubSection, TemplateCard, SlideResult } from '../core/types.js';

export class WorkerAgent {
  /**
   * 执行某一个 Sub-Agent 的完整 Section 大模块生成
   */
  async executeSectionPackage(pkg: SubAgentPackage, basePageIdx = 1): Promise<SlideResult[]> {
    const results: SlideResult[] = [];
    let currentIdx = basePageIdx;

    // 若当前 Sub-Agent 负责封面
    if (pkg.includeCover) {
      const coverSvg = this.renderCoverSVG(pkg.assignedSection.title, pkg.template);
      results.push({
        pageIdx: currentIdx++,
        sectionCode: 'COVER',
        subId: '0.0',
        title: '演示汇报封面',
        svgContent: coverSvg
      });
    }

    // 针对该模块下的各个 1.1, 1.2 等子分块分别渲染页面
    for (const sub of pkg.assignedSection.subSections) {
      const svg = this.renderSubSectionSVG(sub, pkg.assignedSection.title, pkg.template, currentIdx);
      results.push({
        pageIdx: currentIdx++,
        sectionCode: pkg.assignedSection.sectionCode,
        subId: sub.subId,
        title: `[${sub.subId}] ${sub.title}`,
        svgContent: svg
      });
    }

    return results;
  }

  private renderCoverSVG(title: string, template: TemplateCard): string {
    const { palette, fontFamily } = template;
    const width = 1280;
    const height = 720;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${palette.background}" />
  <circle cx="640" cy="360" r="280" fill="${palette.primary}" opacity="0.12" />
  <rect x="590" y="160" width="100" height="6" rx="3" fill="${palette.accent}" />
  <text x="640" y="300" font-family="${fontFamily}" font-size="42" font-weight="bold" fill="${palette.text}" text-anchor="middle">企业级演示文稿汇报</text>
  <text x="640" y="365" font-family="${fontFamily}" font-size="20" fill="${palette.accent}" text-anchor="middle">Multi-Agent 分布式协同生成系统</text>
  <rect x="540" y="520" width="200" height="36" rx="6" fill="${palette.primary}" opacity="0.15" />
  <text x="640" y="543" font-family="${fontFamily}" font-size="13" fill="${palette.text}" text-anchor="middle">CONFIDENTIAL · 专项汇报</text>
  <text x="1200" y="690" font-family="${fontFamily}" font-size="14" fill="${palette.accent}" opacity="0.6" text-anchor="end">01 / PPT AGENT</text>
</svg>`.trim();
  }

  private renderSubSectionSVG(
    sub: OutlineSubSection,
    sectionTitle: string,
    template: TemplateCard,
    pageIdx: number
  ): string {
    const { palette, fontFamily } = template;
    const width = 1280;
    const height = 720;

    let bodyContent = '';

    if (sub.pageType === 'chart' && sub.chartData) {
      bodyContent = `
        <!-- 顶部所属大模块标注 -->
        <text x="80" y="70" font-family="${fontFamily}" font-size="13" font-weight="bold" fill="${palette.accent}">${this.escapeXml(sectionTitle)}</text>
        <text x="80" y="110" font-family="${fontFamily}" font-size="30" font-weight="bold" fill="${palette.text}">[${sub.subId}] ${this.escapeXml(sub.title)}</text>
        <line x1="80" y1="135" x2="1200" y2="135" stroke="${palette.primary}" stroke-width="1.5" opacity="0.2" />

        <!-- 左侧柱状图 -->
        <g transform="translate(80, 170)">
          <rect x="0" y="0" width="560" height="470" rx="8" fill="${palette.background === '#ffffff' ? '#f8fafc' : '#1e293b'}" stroke="${palette.primary}" stroke-width="1.5" stroke-opacity="0.2" />
          <text x="36" y="45" font-family="${fontFamily}" font-size="16" font-weight="bold" fill="${palette.text}">${this.escapeXml(sub.chartData.title)}</text>
          
          ${sub.chartData.series
            .map((s, i) => {
              const y = 100 + i * 85;
              const barWidth = Math.min(400, (s.value / 100) * 380);
              return `
              <g transform="translate(36, ${y})">
                <text x="0" y="-10" font-family="${fontFamily}" font-size="13" fill="${palette.text}">${this.escapeXml(s.name)}</text>
                <rect x="0" y="0" width="420" height="22" rx="4" fill="${palette.primary}" opacity="0.15" />
                <rect x="0" y="0" width="${barWidth}" height="22" rx="4" fill="${i % 2 === 0 ? palette.primary : palette.accent}" />
                <text x="${barWidth + 12}" y="16" font-family="${fontFamily}" font-size="13" font-weight="bold" fill="${palette.text}">${s.value}</text>
              </g>
            `;
            })
            .join('')}
        </g>

        <!-- 右侧论点卡片 -->
        <g transform="translate(680, 170)">
          ${sub.bulletPoints
            .map((bp, i) => {
              const y = i * 150;
              return `
              <g transform="translate(0, ${y})">
                <rect x="0" y="0" width="520" height="130" rx="8" fill="${palette.background === '#ffffff' ? '#f1f5f9' : '#1e293b'}" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.3" />
                <rect x="24" y="24" width="28" height="28" rx="4" fill="${palette.accent}" />
                <text x="38" y="44" font-family="${fontFamily}" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">${i + 1}</text>
                <text x="68" y="44" font-family="${fontFamily}" font-size="15" font-weight="bold" fill="${palette.text}">${this.escapeXml(bp.slice(0, 16))}</text>
                <text x="68" y="78" font-family="${fontFamily}" font-size="13" fill="${palette.text}" opacity="0.8">${this.escapeXml(bp.slice(16) || bp)}</text>
              </g>
            `;
            })
            .join('')}
        </g>
      `;
    } else {
      // 普通内容页 / 总结页
      bodyContent = `
        <!-- 顶部所属大模块标注 -->
        <text x="80" y="70" font-family="${fontFamily}" font-size="13" font-weight="bold" fill="${palette.accent}">${this.escapeXml(sectionTitle)}</text>
        <text x="80" y="110" font-family="${fontFamily}" font-size="30" font-weight="bold" fill="${palette.text}">[${sub.subId}] ${this.escapeXml(sub.title)}</text>
        <line x1="80" y1="135" x2="1200" y2="135" stroke="${palette.primary}" stroke-width="1.5" opacity="0.2" />

        <!-- 三列核心分块卡片 -->
        <g transform="translate(80, 170)">
          ${sub.bulletPoints
            .map((bp, i) => {
              const count = sub.bulletPoints.length;
              const cardWidth = Math.floor(1120 / count) - 20;
              const x = i * (cardWidth + 20);
              return `
              <g transform="translate(${x}, 0)">
                <rect x="0" y="0" width="${cardWidth}" height="470" rx="8" fill="${palette.background === '#ffffff' ? '#f8fafc' : '#1e293b'}" stroke="${palette.primary}" stroke-width="1.5" stroke-opacity="0.3" />
                <rect x="0" y="0" width="${cardWidth}" height="6" rx="3" fill="${i === 0 ? palette.primary : palette.accent}" />
                <rect x="24" y="24" width="28" height="28" rx="4" fill="${palette.primary}" opacity="0.2" />
                <text x="38" y="44" font-family="${fontFamily}" font-size="14" font-weight="bold" fill="${palette.accent}" text-anchor="middle">${i + 1}</text>
                
                <text x="24" y="100" font-family="${fontFamily}" font-size="17" font-weight="bold" fill="${palette.text}">${this.escapeXml(bp.slice(0, 14))}</text>
                <text x="24" y="140" font-family="${fontFamily}" font-size="13" fill="${palette.text}" opacity="0.85">${this.escapeXml(bp.slice(14) || bp)}</text>
                <text x="24" y="230" font-family="${fontFamily}" font-size="12" fill="${palette.accent}">💡 ${this.escapeXml(sub.suggestedVisual)}</text>
              </g>
            `;
            })
            .join('')}
        </g>
      `;
    }

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${palette.background}" />
  <text x="1200" y="690" font-family="${fontFamily}" font-size="14" fill="${palette.accent}" opacity="0.6" text-anchor="end">P0${pageIdx} / ${sub.subId}</text>
  ${bodyContent}
</svg>`.trim();
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
