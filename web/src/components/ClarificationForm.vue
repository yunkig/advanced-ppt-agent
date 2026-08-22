<template>
  <div class="bg-white dark:bg-slate-800/90 border-2 border-slate-800 dark:border-slate-700 rounded-lg p-4 md:p-5 space-y-4 shadow-sm transition-all duration-200">
    <!-- 头部说明 -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>第一阶段：需求参数澄清确认</span>
          <span class="text-xs px-2.5 py-0.5 rounded font-semibold" :class="isSubmitted ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'">
            {{ isSubmitted ? '✓ 参数已对齐' : 'Agent Loop 1 提问表单' }}
          </span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ isSubmitted ? '以下参数已成功对齐并传入二次精准检索：' : '大模型已结合初次联网知识召回，请确认以下生成参数以触发二次精准检索：' }}
        </p>
      </div>
      <span
        class="text-xs font-semibold px-2.5 py-1 rounded border font-mono"
        :class="isSubmitted ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 animate-pulse'"
      >
        {{ isSubmitted ? '已完成对齐' : '等待确认回填' }}
      </span>
    </div>

    <!-- 状态 1: 交互表单态 (等待用户提交) -->
    <div v-if="!isSubmitted" class="space-y-4">
      <!-- 初次 RAG / WebSearch 召回的参考热点方向 -->
      <div v-if="questionnaire.suggestedTopics && questionnaire.suggestedTopics.length > 0" class="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md space-y-2 text-xs">
        <div class="flex items-center justify-between font-bold text-blue-900 dark:text-blue-300">
          <span>基于初次全网知识召回提炼的核心建议方向（点击可快速加入补充重点）：</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="topic in questionnaire.suggestedTopics"
            :key="topic"
            @click="addSuggestedTopic(topic)"
            type="button"
            class="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors text-[11px] font-medium text-left flex items-center gap-1.5"
          >
            <span>+</span>
            <span>{{ topic }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 页面数 -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">1. 生成页数预估</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="form.pageCount"
              type="number"
              min="4"
              max="20"
              class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-blue-500 transition-colors"
            />
            <span class="text-xs text-slate-500 dark:text-slate-400">页</span>
          </div>
        </div>

        <!-- 视觉风格 -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">2. 视觉配色风格</label>
          <select
            v-model="form.style"
            class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-blue-500 transition-colors"
          >
            <option v-for="st in questionnaire.availableStyles" :key="st" :value="st">
              {{ st }}
            </option>
          </select>
        </div>

        <!-- 目标受众 -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">3. 核心目标受众</label>
          <select
            v-model="form.targetAudience"
            class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-blue-500 transition-colors"
          >
            <option v-for="aud in questionnaire.suggestedAudience" :key="aud" :value="aud">
              {{ aud }}
            </option>
          </select>
        </div>

        <!-- 补充重点与数据 -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">4. 补充特定业务重点 / 数据</label>
          <input
            v-model="form.extraNotes"
            type="text"
            placeholder="例如：突出研发效能提升84%，包含柱状对比图"
            class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div class="text-xs text-slate-400 dark:text-slate-500">
          确认后将结合您填写的参数，触发二次精准检索与知识重排 (Rerank)
        </div>
        <button
          @click="submit"
          class="px-6 py-2.5 rounded-md bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          确认参数并执行精准检索 →
        </button>
      </div>
    </div>

    <!-- 状态 2: 已提交归档态 -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
      <div class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
        <div class="text-slate-500 dark:text-slate-400 text-[11px]">预估页数</div>
        <div class="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{{ form.pageCount }} 页</div>
      </div>
      <div class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
        <div class="text-slate-500 dark:text-slate-400 text-[11px]">视觉风格</div>
        <div class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ form.style }}</div>
      </div>
      <div class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
        <div class="text-slate-500 dark:text-slate-400 text-[11px]">目标受众</div>
        <div class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ form.targetAudience }}</div>
      </div>
      <div class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
        <div class="text-slate-500 dark:text-slate-400 text-[11px]">业务重点</div>
        <div class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ form.extraNotes || '无特殊补充' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { ClarificationQuestionnaire, ClarificationAnswers } from '../../../server/src/core/types.js';

const props = defineProps<{
  queryId: string;
  questionnaire: ClarificationQuestionnaire;
  submittedAnswers?: ClarificationAnswers | null;
}>();

const emit = defineEmits<{
  (e: 'submit', answers: ClarificationAnswers): void;
}>();

const isSubmitted = ref(!!props.submittedAnswers);

const form = reactive({
  pageCount: props.submittedAnswers?.pageCount || props.questionnaire.suggestedPageCount || 8,
  style: props.submittedAnswers?.style || props.questionnaire.availableStyles[0] || '科技深邃蓝 (Tech Navy)',
  targetAudience: props.submittedAnswers?.targetAudience || props.questionnaire.suggestedAudience[0] || '公司管理层 / 业务总监',
  extraNotes: props.submittedAnswers?.extraNotes || '重点突出效能指标提升与 Multi-Agent 架构创新'
});

function addSuggestedTopic(topic: string) {
  if (form.extraNotes.includes(topic)) return;
  form.extraNotes = form.extraNotes ? `${form.extraNotes}；${topic}` : topic;
}

function submit() {
  isSubmitted.value = true;
  emit('submit', {
    requestId: props.questionnaire.requestId,
    pageCount: form.pageCount,
    style: form.style,
    targetAudience: form.targetAudience,
    extraNotes: form.extraNotes
  });
}
</script>
