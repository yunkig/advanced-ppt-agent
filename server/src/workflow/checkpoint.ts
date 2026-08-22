/**
 * Checkpoint 状态原子落盘与持久化恢复
 */

import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { QueryID, WorkflowState } from '../core/types.js';

const CHECKPOINT_DIR = resolve(process.cwd(), 'projects/.checkpoints');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function writeCheckpoint(state: WorkflowState): Promise<void> {
  await ensureDir(CHECKPOINT_DIR);
  const targetFile = resolve(CHECKPOINT_DIR, `${state.queryID}.json`);
  const tmpFile = `${targetFile}.${Date.now()}.tmp`;

  const payload = JSON.stringify(state, null, 2);
  await fs.writeFile(tmpFile, payload, 'utf-8');
  await fs.rename(tmpFile, targetFile);
}

export async function readCheckpoint(queryID: QueryID | string): Promise<WorkflowState | null> {
  const targetFile = resolve(CHECKPOINT_DIR, `${queryID}.json`);
  try {
    const raw = await fs.readFile(targetFile, 'utf-8');
    return JSON.parse(raw) as WorkflowState;
  } catch (err: any) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}
