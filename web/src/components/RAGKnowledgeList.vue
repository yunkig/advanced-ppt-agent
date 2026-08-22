<template>
  <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-slate-200">📚 自适应 RAG 知识检索库</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          {{ type === 'broad' ? '初次宽泛召回 (S1.1)' : '二次精准 Rerank (S1.4)' }}
        </span>
      </div>
      <span class="text-xs text-slate-400">已检索 {{ items.length }} 条关联切片</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/40 text-xs space-y-1.5 hover:border-slate-600 transition-colors"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 font-medium text-slate-200 truncate">
            <span class="px-1.5 py-0.5 rounded text-[10px]" :class="getSourceBadge(item.source)">
              {{ getSourceLabel(item.source) }}
            </span>
            <span class="truncate">{{ item.sourceTitle }}</span>
          </div>
          <span class="text-[10px] text-emerald-400 font-mono">匹配度: {{ Math.round(item.score * 100) }}%</span>
        </div>
        <p class="text-slate-400 line-clamp-2 leading-relaxed text-[11px]">
          {{ item.snippet }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RAGItem } from '../../../server/src/core/types.js';

defineProps<{
  items: RAGItem[];
  type: 'broad' | 'precise';
}>();

function getSourceLabel(source: string) {
  switch (source) {
    case 'wenku': return '百度文库';
    case 'netdisk': return '个人网盘';
    case 'scholar': return '学术文献';
    case 'personal_kb': return '知识库';
    default: return '外库';
  }
}

function getSourceBadge(source: string) {
  switch (source) {
    case 'wenku': return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
    case 'netdisk': return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
    case 'scholar': return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    case 'personal_kb': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    default: return 'bg-slate-700 text-slate-300';
  }
}
</script>
