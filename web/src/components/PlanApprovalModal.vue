<template>
  <div class="bg-white dark:bg-slate-800/90 border-2 border-slate-800 dark:border-slate-700 rounded-lg p-4 md:p-5 space-y-4 shadow-sm transition-all duration-200">
    <!-- 头部说明与操作模式切换 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>第二阶段：大纲规划与模板选择确认</span>
          <span
            class="text-xs px-2.5 py-0.5 rounded font-semibold"
            :class="isApproved ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'"
          >
            {{ isApproved ? '✓ 大纲与模板已确认' : (isEditMode ? '✏️ 大纲在线编辑模式' : '大纲双预览') }}
          </span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ isApproved ? '大纲架构与视觉模板已确认，并已派发给 Sub-Agents 生成：' : '您可以直接在线编辑修改各章节与要点，或让 AI 重新构思规划新大纲：' }}
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <button
          v-if="!isApproved"
          @click="isEditMode = !isEditMode"
          class="px-2.5 py-1 rounded border text-xs font-semibold transition-colors"
          :class="isEditMode ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'"
        >
          {{ isEditMode ? '完成编辑预览' : '✏️ 在线直接修改大纲' }}
        </button>
        <span class="px-2.5 py-1 rounded bg-slate-900 dark:bg-blue-600 text-white font-semibold">
          预计共 {{ editablePlan.totalSlides }} 页
        </span>
      </div>
    </div>

    <!-- 状态 1: 交互审批与在线编辑态 -->
    <div v-if="!isApproved" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- 左栏: 层次化大纲树 (占用 7 栏) -->
        <div class="lg:col-span-7 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>一、结构化大纲架构 {{ isEditMode ? '（可直接修改文字）' : '' }}</span>
            <span class="text-slate-400 dark:text-slate-500 font-normal">目标受众：{{ editablePlan.targetAudience }}</span>
          </div>

          <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <!-- 封面项 -->
            <div class="p-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded text-xs flex items-center justify-between">
              <span class="font-bold text-slate-800 dark:text-slate-200">演示汇报封面（主题与主讲人）</span>
              <span class="text-slate-400 dark:text-slate-500">封面页</span>
            </div>

            <!-- 一级大模块列表 -->
            <div
              v-for="sec in editablePlan.sections"
              :key="sec.sectionId"
              class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 space-y-2.5 shadow-2xs"
            >
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5 gap-2">
                <input
                  v-if="isEditMode"
                  v-model="sec.title"
                  type="text"
                  class="font-bold text-xs text-slate-900 dark:text-slate-100 flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-none"
                />
                <span v-else class="font-bold text-xs text-slate-900 dark:text-slate-100">{{ sec.title }}</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded shrink-0">
                  含 {{ sec.subSections.length }} 个子页面
                </span>
              </div>

              <!-- 模块定位描述 -->
              <div class="text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                <span class="font-semibold">定位：</span>
                <input
                  v-if="isEditMode"
                  v-model="sec.summary"
                  type="text"
                  class="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300 focus:outline-none"
                />
                <span v-else>{{ sec.summary }}</span>
              </div>

              <!-- 1.1, 1.2 等子分块 -->
              <div class="space-y-2 pl-2 pt-1 border-l-2 border-slate-200 dark:border-slate-700">
                <div
                  v-for="sub in sec.subSections"
                  :key="sub.subId"
                  class="p-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded space-y-1.5 text-xs"
                >
                  <div class="flex items-center justify-between gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <div class="flex items-center gap-1.5 flex-1">
                      <span class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-mono">
                        {{ sub.subId }}
                      </span>
                      <input
                        v-if="isEditMode"
                        v-model="sub.title"
                        type="text"
                        class="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-0.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <span v-else>{{ sub.title }}</span>
                    </div>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{{ sub.pageType === 'chart' ? '数据图表页' : '核心内容页' }}</span>
                  </div>

                  <!-- 论点列表 -->
                  <div class="space-y-1 pl-3">
                    <div
                      v-for="(bp, bpIdx) in sub.bulletPoints"
                      :key="bpIdx"
                      class="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                    >
                      <span>•</span>
                      <input
                        v-if="isEditMode"
                        v-model="sub.bulletPoints[bpIdx]"
                        type="text"
                        class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                      />
                      <span v-else class="flex-1">{{ bp }}</span>
                      <button
                        v-if="isEditMode && sub.bulletPoints.length > 1"
                        @click="sub.bulletPoints.splice(bpIdx, 1)"
                        class="text-red-500 hover:text-red-700 px-1 text-xs"
                        title="删除该要点"
                      >
                        ×
                      </button>
                    </div>
                    <button
                      v-if="isEditMode"
                      @click="sub.bulletPoints.push('新增论点描述...')"
                      class="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium pt-0.5 block"
                    >
                      + 添加新要点
                    </button>
                  </div>

                  <div class="text-[10px] text-blue-700 dark:text-blue-400 font-medium pl-3 flex items-center gap-1">
                    <span>版式建议：</span>
                    <input
                      v-if="isEditMode"
                      v-model="sub.suggestedVisual"
                      type="text"
                      class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                    />
                    <span v-else>{{ sub.suggestedVisual }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右栏: 模板选择 (占用 5 栏) -->
        <div class="lg:col-span-5 space-y-2">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300">
            二、推荐视觉模板
          </div>
          <div class="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            <div
              v-for="tpl in recommendedTemplates"
              :key="tpl.id"
              @click="selectedTemplateId = tpl.id"
              class="p-3 rounded-lg border-2 cursor-pointer space-y-2 transition-all"
              :class="selectedTemplateId === tpl.id ? 'border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ tpl.name }}</span>
                <span v-if="selectedTemplateId === tpl.id" class="text-[10px] bg-blue-600 dark:bg-blue-500 text-white px-2 py-0.5 rounded font-bold">
                  已选中
                </span>
              </div>

              <!-- 色彩预览 -->
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-400 dark:text-slate-500 text-[11px]">配色方案:</span>
                <div class="flex items-center gap-1.5">
                  <div class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" :style="{ backgroundColor: tpl.palette.primary }" title="主色"></div>
                  <div class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" :style="{ backgroundColor: tpl.palette.secondary }" title="辅色"></div>
                  <div class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" :style="{ backgroundColor: tpl.palette.accent }" title="强调色"></div>
                  <div class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" :style="{ backgroundColor: tpl.palette.background }" title="背景色"></div>
                </div>
              </div>

              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ tpl.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部核心操作按钮 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div class="text-xs text-slate-500 dark:text-slate-400">
          您可以直接基于当前大纲生成，或点击重新规划让 AI 重新生成一版大纲
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="regeneratePlan"
            :disabled="isRegenerating"
            class="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span v-if="isRegenerating" class="w-3 h-3 border-2 border-slate-600 dark:border-slate-400 border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isRegenerating ? '正在重新规划大纲...' : '🔄 让 AI 重新规划大纲' }}</span>
          </button>
          <button
            @click="approveCurrentPlan"
            class="px-6 py-2 rounded-md bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            基于当前大纲，立即生成 PPT ⚡
          </button>
        </div>
      </div>
    </div>

    <!-- 状态 2: 已确认归档态 -->
    <div v-else class="space-y-3 pt-1 text-xs">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
          <div class="text-slate-500 dark:text-slate-400 text-[11px]">大纲模块</div>
          <div class="font-bold text-slate-900 dark:text-slate-100">{{ editablePlan.sections.length }} 个核心大模块（共 {{ editablePlan.totalSlides }} 页）</div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
          <div class="text-slate-500 dark:text-slate-400 text-[11px]">选定模板</div>
          <div class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ currentSelectedTemplate?.name }}</div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md space-y-1">
          <div class="text-slate-500 dark:text-slate-400 text-[11px]">调色板方案</div>
          <div class="flex items-center gap-1.5 pt-0.5">
            <div class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" :style="{ backgroundColor: currentSelectedTemplate?.palette.primary }"></div>
            <div class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" :style="{ backgroundColor: currentSelectedTemplate?.palette.accent }"></div>
            <div class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" :style="{ backgroundColor: currentSelectedTemplate?.palette.background }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { HierarchicalPlan, TemplateCard, PlanTemplateDecision } from '../../../server/src/core/types.js';

const props = defineProps<{
  queryId: string;
  plan: HierarchicalPlan;
  recommendedTemplates: TemplateCard[];
  defaultSelectedId?: string;
  approvedDecision?: PlanTemplateDecision | null;
}>();

const emit = defineEmits<{
  (e: 'decision', decision: PlanTemplateDecision): void;
}>();

const isApproved = ref(!!props.approvedDecision);
const isEditMode = ref(false);
const isRegenerating = ref(false);
const selectedTemplateId = ref(props.defaultSelectedId || props.recommendedTemplates[0]?.id || '');

const editablePlan = reactive<HierarchicalPlan>(JSON.parse(JSON.stringify(props.plan)));

watch(
  () => props.plan,
  newPlan => {
    Object.assign(editablePlan, JSON.parse(JSON.stringify(newPlan)));
    isRegenerating.value = false;
  },
  { deep: true }
);

const currentSelectedTemplate = computed(() => {
  return props.recommendedTemplates.find(t => t.id === selectedTemplateId.value) || props.recommendedTemplates[0];
});

function approveCurrentPlan() {
  isApproved.value = true;
  emit('decision', {
    requestId: props.queryId,
    action: 'approve_all',
    selectedTemplateId: selectedTemplateId.value,
    modifiedPlan: editablePlan
  });
}

function regeneratePlan() {
  isRegenerating.value = true;
  emit('decision', {
    requestId: props.queryId,
    action: 'regenerate_plan'
  });
}
</script>
