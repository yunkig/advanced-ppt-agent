/**
 * 终端端到端完整演示脚本 (S0 -> S1 -> S2 -> S3 -> Done)
 */

import { getWorkflowRunner } from '../workflow/runner.js';
import { getGlobalEventBus } from '../sse/event-bus.js';

async function runDemo() {
  console.log('================================================================');
  console.log('🚀 开始端到端运行 PPT Agent 全链路 (S0 ~ S3)');
  console.log('================================================================\n');

  const bus = getGlobalEventBus();
  const runner = getWorkflowRunner();

  // 监听事件流
  bus.subscribe(msg => {
    if (msg.event === 'stage.enter') {
      console.log(`\n📌 [Stage Enter] -> ${msg.data.stage} (原因: ${msg.data.reason})`);
    } else if (msg.event === 'agent.log') {
      console.log(`🤖 [Agent Log] ${msg.data.message}`);
    } else if (msg.event === 'hitl.clarify_requested') {
      console.log(`\n❓ [HITL 阶段 1: 需求澄清] 收到表单请求:`);
      console.log(`   - 推荐主题: ${msg.data.questionnaire.rewrittenTopic}`);
      console.log(`   - 自动回填中...`);
      setTimeout(() => {
        runner.submitClarification(msg.data.queryID, {
          requestId: msg.data.questionnaire.requestId,
          pageCount: 6,
          style: '科技深邃蓝 (Tech Navy)',
          targetAudience: '公司管理层 / 业务总监',
          extraNotes: '突出交付效能提升 84% 与断线重连 99.8%'
        });
      }, 800);
    } else if (msg.event === 'hitl.plan_template_requested') {
      console.log(`\n📑 [HITL 阶段 2: 大纲与模板确认] 收到 Hierarchical Plan & Template:`);
      console.log(`   - 一级核心大模块: ${msg.data.plan.sections.length} 个`);
      console.log(`   - 预计总页数: ${msg.data.plan.totalSlides} 页`);
      console.log(`   - 选中模板: ${msg.data.recommendedTemplates[0].name}`);
      console.log(`   - 自动通过中...`);
      setTimeout(() => {
        runner.submitPlanDecision(msg.data.queryID, {
          requestId: msg.data.queryID,
          action: 'approve_all',
          selectedTemplateId: msg.data.recommendedTemplates[0].id
        });
      }, 800);
    } else if (msg.event === 'run.end') {
      console.log(`\n🎉 [Run End] 任务成功完成！最终状态: ${msg.data.status}`);
      console.log('================================================================\n');
      process.exit(0);
    }
  });

  const prompt = '@PPT 2026年企业级 AIGC 与 Agent 落地技术白皮书';
  console.log(`👤 用户输入 Prompt: "${prompt}"`);
  await runner.start(prompt);
}

runDemo().catch(err => {
  console.error('Demo Error:', err);
  process.exit(1);
});
