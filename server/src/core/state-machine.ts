/**
 * 全链路显式有限状态机 (Finite State Machine)
 * 严格管理 S0 -> S1 -> S2 -> S3 -> Done 的流转与打回重做机制
 */

import type { WorkflowStage } from './types.js';

export type TransitionReason =
  | 'auto'
  | 'intent_matched'
  | 'intent_rejected'
  | 'hitl_clarify_submit'
  | 'hitl_plan_approve'
  | 'hitl_plan_modify'
  | 'hitl_template_change'
  | 'review_pass'
  | 'review_rework'
  | 'fail'
  | 'recover';

export interface TransitionRule {
  from: WorkflowStage;
  to: WorkflowStage;
  reason: TransitionReason;
}

export const ADVANCED_PPT_TRANSITIONS: TransitionRule[] = [
  // S0: 意图判定
  { from: 'S0_intent_routing', to: 'S1_query_rewrite_search1', reason: 'intent_matched' },
  { from: 'S0_intent_routing', to: 'failed', reason: 'intent_rejected' },

  // S1: WebSearch 检索与需求对齐
  { from: 'S1_query_rewrite_search1', to: 'S1_agent_loop1_clarify', reason: 'auto' },
  { from: 'S1_agent_loop1_clarify', to: 'S1_hitl_clarify_wait', reason: 'auto' },
  { from: 'S1_hitl_clarify_wait', to: 'S1_search2_precise_rerank', reason: 'hitl_clarify_submit' },
  { from: 'S1_search2_precise_rerank', to: 'S2_agent_loop2_plan', reason: 'auto' },

  // S2: 大纲规划与模板映射
  { from: 'S2_agent_loop2_plan', to: 'S2_template_match', reason: 'auto' },
  { from: 'S2_template_match', to: 'S2_hitl_plan_template_wait', reason: 'auto' },
  { from: 'S2_hitl_plan_template_wait', to: 'S3_leader_dispatch', reason: 'hitl_plan_approve' },
  { from: 'S2_hitl_plan_template_wait', to: 'S2_agent_loop2_plan', reason: 'hitl_plan_modify' },
  { from: 'S2_hitl_plan_template_wait', to: 'S2_template_match', reason: 'hitl_template_change' },

  // S3: Leader 拆分任务包 -> Sub-Agent 并行生成 -> Review Agent 质检每个 Sub-Agent 产物 -> 合并
  { from: 'S3_leader_dispatch', to: 'S3_subagent_executing', reason: 'auto' },
  { from: 'S3_subagent_executing', to: 'S3_review_subagent_checking', reason: 'auto' },
  { from: 'S3_review_subagent_checking', to: 'S3_merge_export', reason: 'review_pass' },
  { from: 'S3_review_subagent_checking', to: 'S3_review_rework', reason: 'review_rework' },
  { from: 'S3_review_rework', to: 'S3_subagent_executing', reason: 'auto' },
  { from: 'S3_merge_export', to: 'done', reason: 'auto' }
];

export class InvalidTransitionError extends Error {
  constructor(public readonly from: WorkflowStage, public readonly to: WorkflowStage, public readonly reason: TransitionReason) {
    super(`Invalid transition: ${from} -> ${to} (reason: ${reason})`);
    this.name = 'InvalidTransitionError';
  }
}

export interface StateMachineHooks {
  onEnter?: (to: WorkflowStage, prev: WorkflowStage | undefined, reason: TransitionReason) => Promise<void> | void;
  onLeave?: (from: WorkflowStage, next: WorkflowStage, reason: TransitionReason) => Promise<void> | void;
}

export class AdvancedStateMachine {
  private _state: WorkflowStage;
  private readonly transitions: TransitionRule[];
  private readonly hooks: StateMachineHooks;

  constructor(initial: WorkflowStage, hooks: StateMachineHooks = {}) {
    this._state = initial;
    this.transitions = ADVANCED_PPT_TRANSITIONS;
    this.hooks = hooks;
  }

  get state(): WorkflowStage {
    return this._state;
  }

  canTransition(to: WorkflowStage, reason: TransitionReason): boolean {
    if (to === 'failed' && reason === 'fail') return true;
    return this.transitions.some(
      t => t.from === this._state && t.to === to && t.reason === reason
    );
  }

  async transition(to: WorkflowStage, reason: TransitionReason): Promise<void> {
    if (!this.canTransition(to, reason)) {
      throw new InvalidTransitionError(this._state, to, reason);
    }
    const prev = this._state;
    await this.hooks.onLeave?.(prev, to, reason);
    this._state = to;
    await this.hooks.onEnter?.(to, prev, reason);
  }

  /** 仅用于 checkpoint 恢复已持久化的合法状态 */
  async recover(savedState: WorkflowStage): Promise<void> {
    const prev = this._state;
    this._state = savedState;
    await this.hooks.onEnter?.(savedState, prev, 'recover');
  }
}
