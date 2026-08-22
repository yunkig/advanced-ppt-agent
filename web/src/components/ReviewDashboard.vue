<template>
  <div class="space-y-4">
    <!-- 顶部核心数据指示栏 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg p-3.5 space-y-1 shadow-xs transition-colors">
        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">子模块划分</div>
        <div class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ subAgentPackages.length }} 个大模块</div>
        <div class="text-[11px] text-slate-400 dark:text-slate-500">独立指派 Sub-Agent 生成</div>
      </div>

      <div class="bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg p-3.5 space-y-1 shadow-xs transition-colors">
        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">质检达标情况</div>
        <div class="text-xl font-bold text-emerald-700 dark:text-emerald-400">
          {{ passedSubAgentsCount }} / {{ subAgentPackages.length }} 达标
        </div>
        <div class="text-[11px] text-slate-400 dark:text-slate-500">四维全面核验</div>
      </div>

      <div class="bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg p-3.5 space-y-1 shadow-xs transition-colors">
        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">自省修复次数</div>
        <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ reworkCount }} 次修补</div>
        <div class="text-[11px] text-slate-400 dark:text-slate-500">检测异常并原地修补</div>
      </div>

      <div class="bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg p-3.5 space-y-1 shadow-xs transition-colors flex flex-col justify-between">
        <div>
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">最终成稿与下载</div>
          <div class="text-lg font-bold text-blue-700 dark:text-blue-400">
            {{ isDone ? '合并完成 ✓' : '实时生成中...' }}
          </div>
        </div>
        <div class="pt-1">
          <a
            v-if="mergedPptxPath"
            :href="mergedPptxPath"
            download="presentation.pptx"
            class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 transition-colors shadow-2xs"
          >
            <span>📥 下载原生 PPTX</span>
          </a>
          <span v-else class="text-[11px] text-slate-400 dark:text-slate-500">共 {{ allSlides.length }} 页 Slides</span>
        </div>
      </div>
    </div>

    <!-- Review Agent 针对各个 Sub-Agent 模块成果的质检明细 -->
    <div class="bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg p-4 space-y-3 shadow-xs transition-colors">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">
            Review Agent 模块质检报告
          </h4>
          <span class="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
            四维质量把关
          </span>
        </div>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          综合平均得分：<span class="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-sm">{{ averageScore }} 分</span>
        </span>
      </div>

      <!-- Sub-Agent 质检卡片列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="rep in subAgentReviews"
          :key="rep.subAgentId"
          class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2 text-xs"
        >
          <div class="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700 pb-1.5">
            <div class="font-bold text-slate-800 dark:text-slate-200 truncate">
              {{ rep.subAgentId }}（{{ rep.sectionTitle.slice(0, 10) }}）
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold"
              :class="rep.passed ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700'"
            >
              {{ rep.passed ? '质检通过' : '已自动修复' }}
            </span>
          </div>

          <!-- 四维评分数据 -->
          <div class="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
            <div class="flex justify-between">
              <span>1. 语法表述:</span>
              <span class="font-bold text-slate-900 dark:text-slate-100">{{ rep.scores.syntaxScore }}</span>
            </div>
            <div class="flex justify-between">
              <span>2. 视觉排版:</span>
              <span class="font-bold text-slate-900 dark:text-slate-100">{{ rep.scores.visualScore }}</span>
            </div>
            <div class="flex justify-between">
              <span>3. 大纲覆盖:</span>
              <span class="font-bold text-slate-900 dark:text-slate-100">{{ rep.scores.planAlignmentScore }}</span>
            </div>
            <div class="flex justify-between">
              <span>4. 诉求吻合:</span>
              <span class="font-bold text-slate-900 dark:text-slate-100">{{ rep.scores.intentAlignmentScore }}</span>
            </div>
          </div>

          <div v-if="rep.issues.length > 0" class="text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
            <div v-for="(iss, idx) in rep.issues" :key="idx" class="truncate">
              {{ iss.message }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 合并后全量页面画廊大屏 -->
    <div class="bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-lg p-4 space-y-3 shadow-xs transition-colors">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
        <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>生成幻灯片全景画廊</span>
          <span class="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
            按 1.1、1.2 逻辑编排
          </span>
        </h4>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          共 {{ allSlides.length }} 页
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="slide in allSlides"
          :key="slide.pageIdx"
          class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all space-y-1.5 shadow-2xs"
        >
          <!-- 页面头部信息 -->
          <div class="px-3 pt-2 flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-700 pb-1.5">
            <span class="font-bold text-slate-900 dark:text-slate-100 truncate">第 {{ slide.pageIdx }} 页：{{ slide.title }}</span>
            <span class="text-[10px] text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded font-medium shrink-0">
              {{ slide.ownerSubAgent }}
            </span>
          </div>

          <!-- SVG 渲染容器 -->
          <div
            v-if="slide.svgContent"
            class="aspect-video w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-1 overflow-hidden"
            v-html="slide.svgContent"
          ></div>
          <div
            v-else
            class="aspect-video w-full bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 gap-2"
          >
            <div class="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span>正在生成中...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SubAgentPackage, SubAgentReviewReport } from '../../../server/src/core/types.js';

const props = defineProps<{
  subAgentPackages: SubAgentPackage[];
  subAgentReviews: SubAgentReviewReport[];
  reworkCount: number;
  isDone: boolean;
  mergedPptxPath?: string;
}>();

const passedSubAgentsCount = computed(() => {
  return props.subAgentReviews.filter(r => r.passed || !r.reworkRequired).length;
});

const averageScore = computed(() => {
  if (props.subAgentReviews.length === 0) return 100;
  const total = props.subAgentReviews.reduce((sum, r) => {
    const s = (r.scores.syntaxScore + r.scores.visualScore + r.scores.planAlignmentScore + r.scores.intentAlignmentScore) / 4;
    return sum + s;
  }, 0);
  return Math.round(total / props.subAgentReviews.length);
});

const allSlides = computed(() => {
  const list: Array<{ pageIdx: number; title: string; svgContent: string; ownerSubAgent: string }> = [];
  for (const pkg of props.subAgentPackages) {
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
</script>
