<template>
  <div class="wire-panel p-4">
    <div class="flex items-center justify-between gap-2 overflow-x-auto pb-1">
      <div
        v-for="(st, idx) in stages"
        :key="st.key"
        class="flex items-center gap-3 flex-1 min-w-[190px]"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-7 h-7 rounded border-[1.5px] flex items-center justify-center font-mono-code font-bold text-xs transition-all duration-200"
            :class="getStageBoxClass(st.key)"
          >
            <span v-if="isPassed(st.key)">✓</span>
            <span v-else>0{{ idx }}</span>
          </div>
          <div>
            <div class="text-xs font-semibold" :class="getTextClass(st.key)">
              {{ st.title }}
            </div>
            <div class="text-[10px] font-mono-code text-[var(--ink-soft)]">
              {{ st.subtitle }}
            </div>
          </div>
        </div>
        <div
          v-if="idx < stages.length - 1"
          class="h-[1.5px] flex-1 bg-[var(--rule)] mx-2 transition-colors duration-200"
          :class="{ 'bg-[var(--accent)]': isPassed(stages[idx + 1].key) || isCurrent(st.key) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentStage: string;
}>();

const stages = [
  { key: 'S0', title: '阶段 0: 意图路由', subtitle: 'INTENT_ROUTER' },
  { key: 'S1', title: '阶段 1: 需求对齐', subtitle: 'WEB_SEARCH_RAG' },
  { key: 'S2', title: '阶段 2: 大纲模板', subtitle: 'PLAN_AND_SOLVE' },
  { key: 'S3', title: '阶段 3: 分布式生成', subtitle: 'LEADER_REVIEW' },
  { key: 'done', title: '交付展示', subtitle: 'EXPORT_DONE' }
];

function getStageGroup(stage: string): string {
  if (stage.startsWith('S0')) return 'S0';
  if (stage.startsWith('S1')) return 'S1';
  if (stage.startsWith('S2')) return 'S2';
  if (stage.startsWith('S3')) return 'S3';
  if (stage === 'done') return 'done';
  return 'S0';
}

function isCurrent(key: string): boolean {
  return getStageGroup(props.currentStage) === key;
}

function isPassed(key: string): boolean {
  const currentGroup = getStageGroup(props.currentStage);
  const keys = ['S0', 'S1', 'S2', 'S3', 'done'];
  const curIdx = keys.indexOf(currentGroup);
  const targetIdx = keys.indexOf(key);
  return curIdx > targetIdx || currentGroup === 'done';
}

function getStageBoxClass(key: string) {
  if (isPassed(key)) {
    return 'bg-[var(--ink)] border-[var(--ink)] text-white';
  }
  if (isCurrent(key)) {
    return 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]';
  }
  return 'bg-[var(--box)] border-[var(--rule)] text-[var(--ink-soft)]';
}

function getTextClass(key: string) {
  if (isPassed(key)) return 'text-[var(--ink)] font-bold';
  if (isCurrent(key)) return 'text-[var(--accent)] font-bold';
  return 'text-[var(--ink-soft)]';
}
</script>
