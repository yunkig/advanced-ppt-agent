<template>
  <!-- 仿真手机外壳容器 (小巧精致版: 320px * 660px，自适应夜间模式) -->
  <div class="relative w-[320px] h-[660px] bg-slate-900 dark:bg-black rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-700 dark:border-slate-800 select-none flex flex-col justify-between shrink-0">
    
    <!-- 手机真实屏幕区域 (内嵌圆角屏) -->
    <div class="relative w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[36px] overflow-hidden flex flex-col justify-between border border-slate-800/20 dark:border-slate-700/50 font-sans shadow-inner transition-colors duration-200">
      
      <!-- 1. 顶部状态栏与灵动岛 -->
      <div class="pt-1.5 px-5 flex items-center justify-between z-30 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs shrink-0">
        <span class="text-[11px] font-semibold font-mono text-slate-800 dark:text-slate-200">09:41</span>
        <!-- 灵动岛胶囊 -->
        <div class="w-20 h-4 bg-black rounded-full flex items-center justify-end px-1.5 gap-1 shadow-xs border border-slate-800/50">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" v-if="isRunning"></span>
          <span class="w-1 h-1 rounded-full bg-blue-500/80"></span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[10px] font-mono">
          <span>5G</span>
          <span class="w-3 h-2 border border-slate-600 dark:border-slate-400 rounded-2xs inline-block relative after:content-[''] after:w-1.5 after:h-1 after:bg-slate-600 dark:after:bg-slate-400 after:absolute after:left-0.5 after:top-0.5"></span>
        </div>
      </div>

      <!-- 2. 移动端极简严谨对话与思考流 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-3 space-y-2.5 text-[11px]">
        
        <!-- 欢迎气泡 -->
        <div class="flex items-start gap-1.5">
          <div class="w-5 h-5 rounded bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 font-mono">
            AI
          </div>
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl rounded-tl-xs p-2.5 shadow-xs max-w-[88%] space-y-0.5">
            <div class="font-bold text-slate-900 dark:text-white text-[11px]">演示文稿助手</div>
            <p class="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">
              请提供演示文稿主题或业务诉求，系统将自动检索素材并规划生成。
            </p>
          </div>
        </div>

        <!-- 用户发出的 Prompt 气泡 -->
        <div v-if="userPromptText" class="flex items-start justify-end gap-1.5">
          <div class="bg-slate-900 dark:bg-blue-600 text-white rounded-xl rounded-tr-xs p-2.5 shadow-xs max-w-[88%] text-[10px] leading-relaxed font-medium">
            {{ userPromptText }}
          </div>
          <div class="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[9px] shrink-0 font-mono">
            ME
          </div>
        </div>

        <!-- 思考与检索状态 (严谨置灰折叠块) -->
        <div v-if="currentState?.intent || isBroadSearching" class="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-xl p-2.5 space-y-1.5 text-slate-500 dark:text-slate-400 text-[10px]">
          <div class="flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium text-[10px]">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full" :class="isRunning && !clarificationQuestionnaire ? 'bg-blue-600 dark:bg-blue-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'"></span>
              <span>{{ isRunning && !clarificationQuestionnaire ? '正在分析意图与检索素材...' : '意图分析与素材检索完成' }}</span>
            </span>
            <span class="text-[9px] text-slate-400 dark:text-slate-500 font-mono">STEP 1</span>
          </div>

          <!-- 识别主题与关键词 -->
          <div v-if="currentState?.intent" class="space-y-1 pl-2 border-l border-slate-300 dark:border-slate-600 text-[9px] text-slate-500 dark:text-slate-400">
            <div>
              识别主题：<span class="text-slate-800 dark:text-slate-200 font-medium">「{{ currentState.intent.topic }}」</span>
            </div>
            <div v-if="currentState.search1BroadResults && currentState.search1BroadResults.length > 0" class="flex flex-wrap gap-1 items-center pt-0.5">
              <span>参考资料：</span>
              <span
                v-for="item in currentState.search1BroadResults.slice(0, 3)"
                :key="item.id"
                class="px-1.5 py-0.2 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-[8px] truncate max-w-[120px]"
              >
                {{ item.title }}
              </span>
            </div>
          </div>
        </div>

        <!-- 需求参数确认卡片 -->
        <div v-if="clarificationQuestionnaire" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 shadow-sm space-y-2">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 text-[10px]">制作参数确认</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded font-medium font-mono" :class="savedAnswers ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'">
              {{ savedAnswers ? '已确认' : '待对齐' }}
            </span>
          </div>

          <!-- 未提交状态 -->
          <div v-if="!savedAnswers" class="space-y-1.5 text-[10px]">
            <div>
              <span class="text-slate-500 dark:text-slate-400 text-[9px]">规划页数:</span>
              <div class="flex gap-1 mt-0.5">
                <button
                  v-for="num in [6, 8, 10, 12]"
                  :key="num"
                  @click="mobileForm.pageCount = num"
                  type="button"
                  class="flex-1 py-0.5 rounded text-center border text-[9px] font-medium transition-colors font-mono"
                  :class="mobileForm.pageCount === num ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'"
                >
                  {{ num }}P
                </button>
              </div>
            </div>

            <div>
              <span class="text-slate-500 dark:text-slate-400 text-[9px]">风格与受众:</span>
              <div class="grid grid-cols-2 gap-1 mt-0.5">
                <select v-model="mobileForm.style" class="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-1 text-[9px] text-slate-700 dark:text-slate-200">
                  <option v-for="st in clarificationQuestionnaire.availableStyles" :key="st" :value="st">{{ st }}</option>
                </select>
                <select v-model="mobileForm.targetAudience" class="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-1 text-[9px] text-slate-700 dark:text-slate-200">
                  <option v-for="aud in clarificationQuestionnaire.suggestedAudience" :key="aud" :value="aud">{{ aud }}</option>
                </select>
              </div>
            </div>

            <button
              @click="submitMobileClarify"
              type="button"
              class="w-full py-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded font-medium text-[10px] shadow-xs transition-colors mt-0.5"
            >
              确认参数并规划大纲
            </button>
          </div>

          <!-- 已提交简略展示 -->
          <div v-else class="text-[9px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded flex justify-between">
            <span>{{ savedAnswers.pageCount }}页 · {{ savedAnswers.style.slice(0, 5) }}</span>
            <span class="text-slate-700 dark:text-slate-300 font-medium">受众: {{ savedAnswers.targetAudience.slice(0, 6) }}</span>
          </div>
        </div>

        <!-- 二次精准检索思考态 -->
        <div v-if="currentState?.search2PreciseResults && currentState.search2PreciseResults.length > 0 && !planApprovalData" class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-[9px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <div class="w-2 h-2 border-2 border-slate-600 dark:border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          <span>已锁定关键论据，正在构思章节架构...</span>
        </div>

        <!-- 大纲确认卡片 -->
        <div v-if="planApprovalData" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 shadow-sm space-y-1.5">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 text-[10px]">章节大纲架构 (共{{ planApprovalData.plan.sections.length }}章)</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded font-medium font-mono" :class="savedDecision ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'">
              {{ savedDecision ? '已确认' : '待确认' }}
            </span>
          </div>

          <!-- 简洁大纲章节列表 -->
          <div class="space-y-0.5 max-h-24 overflow-y-auto pr-0.5 text-[9px]">
            <div
              v-for="(sec, sIdx) in planApprovalData.plan.sections"
              :key="sec.sectionId"
              class="p-1 rounded bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 flex items-center justify-between"
            >
              <span class="truncate">{{ sIdx + 1 }}. {{ sec.title }}</span>
              <span class="text-[8px] text-slate-400 dark:text-slate-500 font-mono shrink-0">{{ sec.subSections.length }}P</span>
            </div>
          </div>

          <!-- 未确认状态: 一键生成按钮 -->
          <div v-if="!savedDecision" class="pt-0.5">
            <button
              @click="submitMobilePlan"
              type="button"
              class="w-full py-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded font-medium text-[10px] shadow-xs transition-colors"
            >
              确认大纲并开始生成
            </button>
          </div>
          <div v-else class="text-[9px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded font-medium text-center">
            大纲已确认，正在进行多智能体协同生成
          </div>
        </div>

        <!-- 生成中轻量进度提示 -->
        <div v-if="isRunning && savedDecision && allSlides.length === 0" class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-700 dark:text-slate-300 text-[10px] flex items-center gap-2">
          <div class="w-3 h-3 border-2 border-slate-800 dark:border-blue-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span>正在排版并渲染各章节幻灯片...</span>
        </div>

        <!-- 最终 PPT 成果预览与左右翻页卡片 -->
        <div v-if="allSlides.length > 0" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 shadow-sm space-y-1.5">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 text-[10px]">演示文稿交付预览</span>
            <span class="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{{ currentSlideIdx + 1 }} / {{ allSlides.length }} 页</span>
          </div>

          <!-- 幻灯片渲染视窗 -->
          <div class="relative aspect-video w-full bg-slate-900 dark:bg-black rounded-lg overflow-hidden shadow-inner flex items-center justify-center border border-slate-800">
            <div
              v-if="allSlides[currentSlideIdx]?.svgContent"
              class="w-full h-full"
              v-html="allSlides[currentSlideIdx].svgContent"
            ></div>
            <div v-else class="text-[9px] text-slate-400 animate-pulse">正在生成该页...</div>
          </div>

          <!-- 翻页控制条 -->
          <div class="flex items-center justify-between pt-0.5">
            <button
              @click="prevSlide"
              :disabled="currentSlideIdx === 0"
              class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[9px] font-medium disabled:opacity-30"
            >
              上一页
            </button>
            <span class="text-[9px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
              {{ allSlides[currentSlideIdx]?.title }}
            </span>
            <button
              @click="nextSlide"
              :disabled="currentSlideIdx >= allSlides.length - 1"
              class="px-2 py-0.5 bg-slate-900 dark:bg-blue-600 text-white rounded text-[9px] font-medium disabled:opacity-30"
            >
              下一页
            </button>
          </div>
        </div>

      </div>

      <!-- 3. 手机底部输入与交互操作栏 -->
      <div class="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 space-y-1.5 shrink-0">
        <!-- 快捷词横滑条 -->
        <div class="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            v-for="demo in demoShortPresets"
            :key="demo"
            @click="inputAndTrigger(demo)"
            class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] whitespace-nowrap border border-slate-200 dark:border-slate-700 font-medium"
          >
            {{ demo }}
          </button>
        </div>

        <!-- 输入框与发送按钮 -->
        <div class="flex items-center gap-1.5">
          <input
            v-model="mobileInput"
            @keyup.enter="handleMobileSend"
            type="text"
            placeholder="输入主题或诉求..."
            class="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-750"
            :disabled="isRunning"
          />
          <button
            @click="handleMobileSend"
            :disabled="isRunning || !mobileInput.trim()"
            class="w-6 h-6 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold disabled:opacity-40 transition-transform active:scale-95 shrink-0"
            title="发送"
          >
            ↑
          </button>
        </div>

        <!-- 手机底部 Home 指示条 -->
        <div class="w-24 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-0.5"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from 'vue';
import type {
  WorkflowState,
  ClarificationQuestionnaire,
  ClarificationAnswers,
  PlanTemplateDecision
} from '../../../server/src/core/types.js';

const props = defineProps<{
  currentState: WorkflowState | null;
  isRunning: boolean;
  clarificationQuestionnaire: ClarificationQuestionnaire | null;
  planApprovalData: any | null;
  savedAnswers: ClarificationAnswers | null;
  savedDecision: PlanTemplateDecision | null;
  isDarkMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'start', prompt: string): void;
  (e: 'clarify', answers: ClarificationAnswers): void;
  (e: 'planDecision', decision: PlanTemplateDecision): void;
}>();

const mobileInput = ref('@PPT 2026年企业级 AIGC 与 Agent 落地技术白皮书');
const userPromptText = ref('');
const chatContainer = ref<HTMLElement | null>(null);
const currentSlideIdx = ref(0);

const demoShortPresets = [
  '2026企业级白皮书',
  '年度述职与规划 PPT',
  '商业路演计划书 BP'
];

const mobileForm = reactive({
  pageCount: 8,
  style: '科技深邃蓝 (Tech Navy)',
  targetAudience: '公司管理层 / 业务总监',
  extraNotes: '突出研发效能提升与 Multi-Agent 架构'
});

const isBroadSearching = computed(() => {
  return props.isRunning && props.currentState?.stage === 'S1_query_rewrite_search1' && !props.currentState?.search1BroadResults;
});

const allSlides = computed(() => {
  if (!props.currentState?.subAgentPackages) return [];
  const list: Array<{ pageIdx: number; title: string; svgContent: string; ownerSubAgent: string }> = [];
  for (const pkg of props.currentState.subAgentPackages) {
    if (pkg.generatedSlides && pkg.generatedSlides.length > 0) {
      for (const s of pkg.generatedSlides) {
        list.push({
          pageIdx: s.pageIdx,
          title: s.title,
          svgContent: s.svgContent,
          ownerSubAgent: pkg.subAgentId
        });
      }
    }
  }
  return list.sort((a, b) => a.pageIdx - b.pageIdx);
});

watch(
  () => [props.currentState?.stage, props.clarificationQuestionnaire, props.planApprovalData, allSlides.value.length],
  () => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
  }
);

function inputAndTrigger(demo: string) {
  mobileInput.value = demo;
  handleMobileSend();
}

function handleMobileSend() {
  if (!mobileInput.value.trim() || props.isRunning) return;
  userPromptText.value = mobileInput.value;
  emit('start', mobileInput.value);
}

function submitMobileClarify() {
  if (!props.clarificationQuestionnaire) return;
  emit('clarify', {
    requestId: props.clarificationQuestionnaire.requestId,
    pageCount: mobileForm.pageCount,
    style: mobileForm.style,
    targetAudience: mobileForm.targetAudience,
    extraNotes: mobileForm.extraNotes
  });
}

function submitMobilePlan() {
  if (!props.planApprovalData) return;
  emit('planDecision', {
    requestId: props.currentState?.queryID || '',
    action: 'approve_all',
    selectedTemplateId: props.planApprovalData.recommendedTemplates[0]?.id
  });
}

function prevSlide() {
  if (currentSlideIdx.value > 0) currentSlideIdx.value--;
}

function nextSlide() {
  if (currentSlideIdx.value < allSlides.value.length - 1) currentSlideIdx.value++;
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
