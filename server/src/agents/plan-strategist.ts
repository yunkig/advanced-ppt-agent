/**
 * S2: Plan & Solve 层次化大纲规划 Agent (Plan Strategist)
 * 基于用户的核心诉求与 WebSearch 联网检索结果，生成结构化 Markdown 层次大纲
 * 结构：5 个核心一级大板块（Section），各板块下包含 1.1, 1.2, 2.1, 2.2 等子分块
 */

import type { HierarchicalPlan, OutlineSection, WebSearchItem, ClarificationAnswers } from '../core/types.js';

export class PlanStrategistAgent {
  async generatePlan(
    topic: string,
    answers: ClarificationAnswers,
    search2Results: WebSearchItem[],
    version = 1
  ): Promise<HierarchicalPlan> {
    const targetPages = answers.pageCount || 8;
    const versionTag = version > 1 ? `（第 ${version} 版优化）` : '';
    const searchContextSnippet = search2Results[0]?.snippet || '行业最佳实践';

    // 规划 4~5 个核心一级大模块 (Section)
    const sections: OutlineSection[] = [
      {
        sectionId: 1,
        sectionCode: 'SEC-01',
        title: '01 · 业务背景与行业现状洞察',
        summary: '剖析当前行业痛点、市场宏观趋势与业务转型迫切性',
        subSections: [
          {
            subId: '1.1',
            title: '宏观行业趋势与市场发展机遇',
            pageType: 'content',
            bulletPoints: [
              '大模型与 Agentic Workflow 进入规模化落地深水区',
              '企业对自动化演示文稿与高保真排版的需求增长 320%',
              '多模态技术重塑长文案到视觉资产的生产链路'
            ],
            suggestedVisual: '左右双栏图文对比 + 行业趋势数据高亮'
          },
          {
            subId: '1.2',
            title: '传统模式核心痛点与协作瓶颈',
            pageType: 'content',
            bulletPoints: [
              '传统单向生成耗时长，单点错误导致全量返工',
              '长文档到演示文稿的信息提炼与结构化对齐成本高昂',
              '弱网与多轮交互下容易丢状态，缺乏断线无感续传'
            ],
            suggestedVisual: '三列痛点警示卡片 + 核心瓶颈标签'
          }
        ]
      },
      {
        sectionId: 2,
        sectionCode: 'SEC-02',
        title: '02 · Multi-Agent 系统架构与核心技术',
        summary: '详细阐述 S0 路由、S1 联网检索、S2 层次化大纲与 S3 分布式协作机制',
        subSections: [
          {
            subId: '2.1',
            title: '全链路 Agent 编排体系与四阶段闭环',
            pageType: 'content',
            bulletPoints: [
              'S0/S1: 意图识别 + WebSearch 联网检索与自适应澄清',
              'S2: Plan-and-Solve 层次化大纲规划 + 模板解耦映射',
              'S3: Leader-Worker 模块化分发 + Review 四维质检'
            ],
            suggestedVisual: '四阶段流式架构图 + 模块交互闭环箭头'
          },
          {
            subId: '2.2',
            title: '高可用状态机与 SSE 流式通信机制',
            pageType: 'content',
            bulletPoints: [
              '14 阶段有限状态机，严格防非法状态越权跳转',
              '基于指数退避 Full Jitter 算法保障弱网断线重连',
              'queryID 检查点原子持久化，支持异常无感恢复'
            ],
            suggestedVisual: '状态转移时序图 + 技术高可用指标'
          }
        ]
      },
      {
        sectionId: 3,
        sectionCode: 'SEC-03',
        title: '03 · 核心业务指标达成与效能复盘',
        summary: '用真实数据自证综合交付效能、质检达标率与研发收益',
        subSections: [
          {
            subId: '3.1',
            title: '关键交付指标对比 (Before vs After)',
            pageType: 'chart',
            bulletPoints: [
              '综合交付周期由 48 小时缩短至 6 小时（效能提升 84%）',
              '单页排版与多模态质检合格率稳定在 98.5%',
              '线上用户 NPS 满意度由 68 分跃升至 92 分'
            ],
            chartData: {
              type: 'bar',
              title: '核心业务效能对比',
              series: [
                { name: '传统交付耗时(h)', value: 48 },
                { name: 'Agent交付耗时(h)', value: 6 },
                { name: '传统质检通过率(%)', value: 70 },
                { name: '4D质检通过率(%)', value: 98 }
              ]
            },
            suggestedVisual: '柱状对比图与高亮指标卡片左右排列'
          },
          {
            subId: '3.2',
            title: '资源开销与错误收敛收益分析',
            pageType: 'content',
            bulletPoints: [
              'Sub-Agent 模块隔离并发，Token 窗口消耗降低 55%',
              '自省修复闭环使平均返工轮次由 3.2 次下降至 0.4 次',
              '高并发场景下保障服务稳定可用（99.8% SLA）'
            ],
            suggestedVisual: '成本效益对比卡片 + 收益指标徽章'
          }
        ]
      },
      {
        sectionId: 4,
        sectionCode: 'SEC-04',
        title: '04 · 典型落地实践与自省修复案例',
        summary: '分享复杂长文稿生成中的真实异常拦截与自动化修补案例',
        subSections: [
          {
            subId: '4.1',
            title: '标杆业务落地实施路径',
            pageType: 'content',
            bulletPoints: [
              '标准化接入流程：需求澄清 -> 大纲审批 -> 并发交付',
              '多场景适配：技术汇报、述职总结、商业路演 BP',
              '模块化模板资产库，支持企业级视觉规范一键套用'
            ],
            suggestedVisual: '实施流程时间轴 + 业务场景标签'
          },
          {
            subId: '4.2',
            title: 'Review Agent 异常拦截与 autoFix 案例',
            pageType: 'content',
            bulletPoints: [
              '多模态排版检测：自动发现并修复 X/Y 坐标文字溢出',
              '底图缺失拦截：补齐背景 rect 防止透明黑底渲染',
              '大纲覆盖核验：确保 1.x 子分块核心论点无遗漏'
            ],
            suggestedVisual: '质检对比示意图 + 问题拦截类型分布'
          }
        ]
      },
      {
        sectionId: 5,
        sectionCode: 'SEC-05',
        title: '05 · 次年战略规划与演进路线图',
        summary: '明确技术体系演进方向、团队资源诉求与预期业务增量',
        subSections: [
          {
            subId: '5.1',
            title: '技术路线演进与能力深化',
            pageType: 'content',
            bulletPoints: [
              '演进方向 1: 引入视觉大模型实现微观排版美学打分',
              '演进方向 2: 拓展富交互组件与动画一键生成能力',
              '演进方向 3: 深度连接企业私有知识库与数据底座'
            ],
            suggestedVisual: '三阶段路线演进卡片 + 里程碑标记'
          },
          {
            subId: '5.2',
            title: '总结复盘与核心行动项',
            pageType: 'summary',
            bulletPoints: [
              '完成从单向生成到「人在回路 + 多智能体自省闭环」的范式跃迁',
              '持续强化工程可靠性与极端弱网场景下的用户体验',
              '感谢各业务团队协同支持，开启下一代智能演示新纪元'
            ],
            suggestedVisual: '左侧复盘总结 + 右侧愿景展望大字排版'
          }
        ]
      }
    ];

    // 计算总页数：封面 1 页 + 各 Section 的子页数
    let totalSlides = 1; // 封面
    sections.forEach(sec => {
      totalSlides += sec.subSections.length;
    });

    // 生成美观易读的 Markdown 格式文本大纲
    const mdLines: string[] = [
      `# ${topic}`,
      `> 目标受众：${answers.targetAudience} | 视觉风格：${answers.style}`,
      ''
    ];

    sections.forEach(sec => {
      mdLines.push(`## ${sec.title}`);
      mdLines.push(`*模块定位：${sec.summary}*`);
      sec.subSections.forEach(sub => {
        mdLines.push(`- **[${sub.subId}] ${sub.title}** (${sub.pageType})`);
        sub.bulletPoints.forEach(bp => {
          mdLines.push(`  - ${bp}`);
        });
      });
      mdLines.push('');
    });

    return {
      title: topic,
      themeStyle: answers.style,
      targetAudience: answers.targetAudience,
      totalSlides,
      markdownOutline: mdLines.join('\n'),
      sections
    };
  }
}
