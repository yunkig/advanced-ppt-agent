<template>
  <div class="bg-white dark:bg-slate-800/90 border-2 border-slate-800 dark:border-slate-700 rounded-lg p-4 space-y-3 shadow-sm transition-colors duration-200">
    <!-- 头部说明 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
      <div class="flex items-center gap-2.5">
        <div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{{ type === 'broad' ? '阶段 1 · 初次联网检索与知识库召回 (WebSearch & RAG)' : '阶段 1 · 二次精准检索与知识重排 (Rerank)' }}</span>
            <span
              class="text-[11px] px-2 py-0.5 rounded font-semibold"
              :class="type === 'broad' ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'"
            >
              {{ type === 'broad' ? '宽泛知识召回' : '精准参数重排' }}
            </span>
          </h4>
          <p v-if="rewrittenQuery" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            检索重写 Query：<span class="font-semibold text-slate-700 dark:text-slate-200">「{{ rewrittenQuery }}」</span>
          </p>
        </div>
      </div>
      <span class="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
        已召回权威知识：<span class="text-blue-700 dark:text-blue-400 font-bold font-mono">{{ items.length }}</span> 条
      </span>
    </div>

    <!-- 知识条目卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md text-xs space-y-1.5 hover:border-slate-400 dark:hover:border-slate-500 transition-colors shadow-2xs"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 truncate">
            <span class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-mono">
              {{ item.sourceDomain }}
            </span>
            <span class="truncate">{{ item.title }}</span>
          </div>
          <span class="text-[11px] font-bold text-blue-700 dark:text-blue-400 shrink-0 font-mono bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            匹配度 {{ Math.round(item.score * 100) }}%
          </span>
        </div>
        <p class="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed text-[11px]">
          {{ item.snippet }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WebSearchItem } from '../../../server/src/core/types.js';

defineProps<{
  items: WebSearchItem[];
  type: 'broad' | 'precise';
  rewrittenQuery?: string;
}>();
</script>
