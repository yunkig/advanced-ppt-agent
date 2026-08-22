/**
 * 指数退避 + Full Jitter 算法
 * 用于断线重连与异步 Agent 任务重试
 */

export interface BackoffOptions {
  baseMs?: number;
  maxMs?: number;
  factor?: number;
  jitter?: 'full' | 'none';
}

export function calculateBackoff(
  attempt: number,
  options: BackoffOptions = {}
): number {
  const baseMs = options.baseMs ?? 300;
  const maxMs = options.maxMs ?? 10000;
  const factor = options.factor ?? 2;
  const jitter = options.jitter ?? 'full';

  const expBackoff = Math.min(maxMs, baseMs * Math.pow(factor, attempt));

  if (jitter === 'full') {
    return Math.floor(Math.random() * expBackoff);
  }
  return expBackoff;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
