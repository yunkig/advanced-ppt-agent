<template>
  <div :class="{ dark: isDarkMode }" class="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <div class="max-w-[1520px] mx-auto p-3 md:p-6 space-y-4 font-sans-main">
      
      <!-- 顶部导航栏 -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-slate-800 dark:border-slate-700">
        <div class="space-y-0.5">
          <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>PPT Agent Pro</span>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-900 dark:bg-blue-600 text-white font-mono">
              多智能体全链路演示系统
            </span>
          </h1>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            左侧移动真机模拟 · 中间核心业务工作区 · 右侧独立状态机与事件流监控窗口
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- 夜间/白天模式切换按钮 -->
          <button
            @click="toggleDarkMode"
            class="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="切换深色/浅色模式"
          >
            <span>{{ isDarkMode ? '🌙 夜间模式' : '☀️ 白天模式' }}</span>
          </button>

          <!-- 实时通信状态 -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
            <span class="w-2 h-2 rounded-full" :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
            <span>{{ isConnected ? '通信正常' : '已断开' }}</span>
          </div>

          <!-- 重置演示 -->
          <button
            @click="resetAll"
            class="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            重置演示
          </button>
        </div>
      </header>

      <!-- 三栏专业级工作区布局 (左: 手机真机模拟 | 中: 主生成流水线 | 右: 独立状态机视窗) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- ================= 1. 最左侧: 仿真手机屏幕 (占用 3 栏，约 320px) ================= -->
        <div class="lg:col-span-3 xl:col-span-3 flex flex-col items-start space-y-2 sticky top-4">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pl-1">
            <span>📱 手机端真实交互体验</span>
          </div>
          
          <MobileSimulator
            :currentState="currentState"
            :isRunning="isRunning"
            :clarificationQuestionnaire="clarificationQuestionnaire"
            :planApprovalData="planApprovalData"
            :savedAnswers="savedAnswers"
            :savedDecision="savedDecision"
            :isDarkMode="isDarkMode"
            @start="handleStartWithPrompt"
            @clarify="handleClarifySubmit"
            @planDecision="handlePlanDecision"
          />
        </div>

        <!-- ================= 2. 中间: 主业务生成与大纲工作台 (占用 6 栏) ================= -->
        <main class="lg:col-span-6 xl:col-span-6 space-y-4">
          
          <!-- 用户输入与发起区域 -->
          <div class="bg-white dark:bg-slate-800/90 border-2 border-slate-800 dark:border-slate-700 rounded-lg p-4 space-y-3 shadow-sm animate-fade-in">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                输入制作诉求或使用 @PPT 触发：
              </label>
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  v-model="promptInput"
                  @keyup.enter="handleStart"
                  type="text"
                  placeholder="例如：@PPT 2026年企业级 AIGC 与 Agent 落地技术白皮书"
                  class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-blue-500 transition-colors"
                  :disabled="isRunning"
                />
                <button
                  @click="handleStart"
                  :disabled="isRunning || !promptInput.trim()"
                  class="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span v-if="isRunning" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ isRunning ? '生成中...' : '开始生成 PPT' }}</span>
                </button>
              </div>
            </div>

            <!-- 快捷示例 -->
            <div class="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
              <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">快捷示例:</span>
              <button
                v-for="demo in demoPresets"
                :key="demo"
                @click="promptInput = demo"
                class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] transition-colors"
              >
                {{ demo }}
              </button>
            </div>
          </div>

          <!-- 阶段 0: 意图判定结果卡片 -->
          <div
            v-if="currentState?.intent"
            class="bg-white dark:bg-slate-800/90 border-2 border-slate-800 dark:border-slate-700 rounded-lg p-3.5 flex items-center justify-between shadow-xs animate-fade-in"
          >
            <div class="flex items-center gap-2.5">
              <span class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-700">
                阶段 0 · 意图命中
              </span>
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-slate-100">
                  提取主题：「{{ currentState.intent.topic }}」
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  依据：{{ currentState.intent.reason }}
                </div>
              </div>
            </div>
            <div class="text-right text-xs">
              <span class="text-slate-400 dark:text-slate-500 text-[11px]">置信度：</span>
              <span class="text-emerald-700 dark:text-emerald-400 font-bold text-xs font-mono">{{ Math.round(currentState.intent.confidence * 100) }}%</span>
            </div>
          </div>

          <!-- 阶段 1: 正在初次检索加载中 -->
          <div
            v-if="isBroadSearching"
            class="bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg p-3.5 flex items-center gap-2.5 shadow-xs animate-fade-in text-xs text-slate-700 dark:text-slate-300"
          >
            <div class="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div class="font-bold text-slate-800 dark:text-slate-200">阶段 1 · 正在并行执行：Query 重写 + 初次全网与知识库宽泛召回...</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">检索机器之心、36氪等权威数据以构建提问上下文</div>
            </div>
          </div>

          <!-- 阶段 1: 初次宽泛联网检索结果卡片 -->
          <div v-if="currentState?.search1BroadResults && currentState.search1BroadResults.length > 0" class="animate-fade-in">
            <WebSearchResults
              :items="currentState.search1BroadResults"
              :rewrittenQuery="currentState.rewrittenQuery"
              type="broad"
            />
          </div>

          <!-- 阶段 1: 需求参数澄清确认表单 / 归档卡片 -->
          <div v-if="clarificationQuestionnaire" class="animate-fade-in">
            <ClarificationForm
              :queryId="currentState?.queryID || ''"
              :questionnaire="clarificationQuestionnaire"
              :submittedAnswers="savedAnswers"
              @submit="handleClarifySubmit"
            />
          </div>

          <!-- 阶段 1: 二次精准检索与知识重排 (Rerank) -->
          <div v-if="currentState?.search2PreciseResults && currentState.search2PreciseResults.length > 0" class="animate-fade-in">
            <WebSearchResults
              :items="currentState.search2PreciseResults"
              :rewrittenQuery="currentState.rewrittenQuery"
              type="precise"
            />
          </div>

          <!-- 阶段 2: 层次化大纲规划与模板审批 (支持 ✏️ 在线直接编辑) -->
          <div v-if="planApprovalData" class="animate-fade-in">
            <PlanApprovalModal
              :queryId="currentState?.queryID || ''"
              :plan="planApprovalData.plan"
              :recommendedTemplates="planApprovalData.recommendedTemplates"
              :defaultSelectedId="planApprovalData.defaultSelectedId"
              :approvedDecision="savedDecision"
              @decision="handlePlanDecision"
            />
          </div>

          <!-- 阶段 3: Sub-Agent 模块化分布式生成与 Review 4D 质检画廊 -->
          <div v-if="currentState?.subAgentPackages && currentState.subAgentPackages.length > 0" class="animate-fade-in">
            <ReviewDashboard
              :subAgentPackages="currentState.subAgentPackages"
              :subAgentReviews="currentState.subAgentReviews || []"
              :reworkCount="currentState.reworkCount || 0"
              :isDone="currentState.stage === 'done'"
              :mergedPptxPath="currentState.mergedPptxPath"
            />
          </div>
        </main>

        <!-- ================= 3. 最右侧: 独立状态机流转与实时事件流视窗 (占用 3 栏) ================= -->
        <aside class="lg:col-span-3 xl:col-span-3 bg-white dark:bg-slate-800/90 border-2 border-slate-800 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm sticky top-4 space-y-0">
          <!-- 视窗标题 -->
          <div class="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-800 dark:border-slate-700 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">
              状态机流转与执行监控
            </h2>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">14-STAGES</span>
          </div>

          <!-- 状态流转步骤列表 -->
          <div class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <div
              v-for="(st, idx) in fsmStages"
              :key="st.key"
              class="p-2.5 flex items-start gap-2 transition-colors text-xs"
              :class="isCurrent(st.key) ? 'bg-amber-50/70 dark:bg-amber-950/30' : ''"
            >
              <span
                class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                :class="getStagePinClass(st.key)"
              >
                {{ isPassed(st.key) ? '✓' : idx + 1 }}
              </span>
              <div class="space-y-0.5 flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-[11px]" :class="isCurrent(st.key) ? 'text-amber-800 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'">
                    {{ st.name }}
                  </span>
                  <span v-if="isCurrent(st.key)" class="px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[9px] font-bold animate-pulse">
                    执行中
                  </span>
                </div>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {{ st.desc }}
                </p>
              </div>
            </div>
          </div>

          <!-- 实时执行日志流视窗 -->
          <div class="border-t-2 border-slate-800 dark:border-slate-700 p-3 space-y-1.5 bg-slate-50 dark:bg-slate-900/60">
            <div class="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
              <span class="flex items-center gap-1.5 text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full" :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
                <span>实时执行事件流</span>
              </span>
              <span v-if="currentState?.queryID" class="text-[9px] text-slate-400 font-mono font-normal">
                {{ currentState.queryID.slice(0, 8) }}
              </span>
            </div>

            <div class="space-y-1 max-h-52 overflow-y-auto text-[10px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono">
              <div v-for="(log, idx) in logs" :key="idx" class="flex items-start gap-1 leading-tight">
                <span class="text-slate-400 text-[9px] shrink-0">[{{ log.time }}]</span>
                <span class="text-blue-600 dark:text-blue-400 font-bold shrink-0">❯</span>
                <span class="text-slate-800 dark:text-slate-200 break-all font-sans text-[10px]">{{ log.message }}</span>
              </div>
              <div v-if="logs.length === 0" class="text-slate-400 dark:text-slate-500 italic font-sans text-[10px]">等待发起任务...</div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSSE } from './composables/useSSE.js';
import MobileSimulator from './components/MobileSimulator.vue';
import WebSearchResults from './components/WebSearchResults.vue';
import ClarificationForm from './components/ClarificationForm.vue';
import PlanApprovalModal from './components/PlanApprovalModal.vue';
import ReviewDashboard from './components/ReviewDashboard.vue';
import type {
  WorkflowState,
  ClarificationQuestionnaire,
  ClarificationAnswers,
  PlanTemplateDecision
} from '../../server/src/core/types.js';

const isDarkMode = ref(false);
const promptInput = ref('@PPT 2026年企业级 AIGC 与 Agent 落地技术白皮书');
const isRunning = ref(false);
const currentState = ref<WorkflowState | null>(null);
const clarificationQuestionnaire = ref<ClarificationQuestionnaire | null>(null);
const planApprovalData = ref<any | null>(null);
const savedAnswers = ref<ClarificationAnswers | null>(null);
const savedDecision = ref<PlanTemplateDecision | null>(null);
const logs = ref<Array<{ time: string; message: string }>>([]);

onMounted(() => {
  const saved = localStorage.getItem('theme_mode');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
});

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme_mode', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme_mode', 'light');
  }
}

const demoPresets = [
  '@PPT 2026年企业级 AIGC 与 Agent 落地技术白皮书',
  '帮我做一份百度文库年度述职与总结规划 PPT',
  '@PPT 商业路演计划书 (BP) 黄金 10 页',
  '技术委员会架构设计评审与选型汇报'
];

const isBroadSearching = computed(() => {
  return isRunning.value && currentState.value?.stage === 'S1_query_rewrite_search1' && !currentState.value?.search1BroadResults;
});

const fsmStages = [
  { key: 'S0', name: '阶段 0 · 意图识别与路由', desc: '识别 @PPT 与自然语言' },
  { key: 'S1_BROAD', name: '阶段 1.1 · 初次宽泛召回与澄清', desc: 'Query重写 + 初次全网检索' },
  { key: 'S1_PRECISE', name: '阶段 1.2 · 二次精准 Rerank', desc: '回填后精准重排' },
  { key: 'S2', name: '阶段 2 · 层次大纲与模板审批', desc: '5大模块+模板在线编辑' },
  { key: 'S3_DISPATCH', name: '阶段 3 · 模块拆解与并发生成', desc: 'Leader分发+Sub-Agent' },
  { key: 'S3_REVIEW', name: '阶段 3 · 四维质检与自省修复', desc: 'Review质检+autoFix' },
  { key: 'done', name: '交付阶段 · 多模块合并导出', desc: '全量合并导出完整 PPTX' }
];

function getStageGroup(stage: string): string {
  if (stage.startsWith('S0')) return 'S0';
  if (stage === 'S1_query_rewrite_search1' || stage === 'S1_agent_loop1_clarify' || stage === 'S1_hitl_clarify_wait') {
    return 'S1_BROAD';
  }
  if (stage === 'S1_search2_precise_rerank') return 'S1_PRECISE';
  if (stage.startsWith('S2')) return 'S2';
  if (stage === 'S3_leader_dispatch' || stage === 'S3_subagent_executing') return 'S3_DISPATCH';
  if (stage.startsWith('S3_review')) return 'S3_REVIEW';
  if (stage === 'S3_merge_export' || stage === 'done') return 'done';
  return 'S0';
}

function isCurrent(key: string): boolean {
  return getStageGroup(currentState.value?.stage || 'S0_intent_routing') === key;
}

function isPassed(key: string): boolean {
  const currentGroup = getStageGroup(currentState.value?.stage || 'S0_intent_routing');
  const keys = ['S0', 'S1_BROAD', 'S1_PRECISE', 'S2', 'S3_DISPATCH', 'S3_REVIEW', 'done'];
  const curIdx = keys.indexOf(currentGroup);
  const targetIdx = keys.indexOf(key);
  return curIdx > targetIdx || currentGroup === 'done';
}

function getStagePinClass(key: string) {
  if (isPassed(key)) {
    return 'bg-slate-900 dark:bg-blue-600 text-white';
  }
  if (isCurrent(key)) {
    return 'bg-amber-600 dark:bg-amber-500 text-white';
  }
  return 'border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900';
}

const { isConnected } = useSSE((event, data) => {
  const now = new Date().toLocaleTimeString();

  if (event === 'agent.log') {
    logs.value.push({ time: now, message: data.message });
  }

  if (event === 'stage.enter') {
    currentState.value = data.state;
    logs.value.push({ time: now, message: `状态流转至: ${data.stage} (${data.reason})` });
  }

  if (event === 'hitl.clarify_requested') {
    clarificationQuestionnaire.value = data.questionnaire;
    if (currentState.value) {
      if (data.search1BroadResults) currentState.value.search1BroadResults = data.search1BroadResults;
      if (data.rewrittenQuery) currentState.value.rewrittenQuery = data.rewrittenQuery;
    }
  }

  if (event === 'hitl.plan_template_requested') {
    planApprovalData.value = data;
  }

  if (event === 'run.end') {
    isRunning.value = false;
    logs.value.push({ time: now, message: `全流程执行完成，最终状态: ${data.status}` });
  }
});

async function handleStart() {
  handleStartWithPrompt(promptInput.value);
}

async function handleStartWithPrompt(prompt: string) {
  if (!prompt.trim()) return;
  isRunning.value = true;
  clarificationQuestionnaire.value = null;
  planApprovalData.value = null;
  savedAnswers.value = null;
  savedDecision.value = null;
  logs.value = [{ time: new Date().toLocaleTimeString(), message: `发起任务: "${prompt}"` }];

  try {
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    currentState.value = data.state;
  } catch (err) {
    console.error('Failed to start run:', err);
    isRunning.value = false;
  }
}

async function handleClarifySubmit(answers: ClarificationAnswers) {
  savedAnswers.value = answers;
  logs.value.push({ time: new Date().toLocaleTimeString(), message: '已提交澄清参数，正在执行二次精准检索与 Rerank...' });
  await fetch('/api/hitl/clarify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queryID: currentState.value?.queryID,
      answers
    })
  });
}

async function handlePlanDecision(decision: PlanTemplateDecision) {
  savedDecision.value = decision;
  logs.value.push({ time: new Date().toLocaleTimeString(), message: '大纲与模板已通过，正在派发至各 Sub-Agent...' });
  await fetch('/api/hitl/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queryID: currentState.value?.queryID,
      decision
    })
  });
}

function resetAll() {
  currentState.value = null;
  clarificationQuestionnaire.value = null;
  planApprovalData.value = null;
  savedAnswers.value = null;
  savedDecision.value = null;
  isRunning.value = false;
  logs.value = [];
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
