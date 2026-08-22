/**
 * API 路由定义
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getWorkflowRunner } from '../workflow/runner.js';
import { getGlobalEventBus } from '../sse/event-bus.js';
import { readCheckpoint } from '../workflow/checkpoint.js';

export const apiRouter = Router();

/** 启动任务 */
apiRouter.post('/run', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const runner = getWorkflowRunner();
  const state = await runner.start(prompt);
  res.json({
    queryID: state.queryID,
    stage: state.stage,
    state
  });
});

/** 阶段 1: 提交澄清表单 (Tool: Ask user question 回填) */
apiRouter.post('/hitl/clarify', (req: Request, res: Response) => {
  const { queryID, answers } = req.body;
  if (!queryID || !answers) {
    res.status(400).json({ error: 'queryID and answers are required' });
    return;
  }

  const runner = getWorkflowRunner();
  const ok = runner.submitClarification(queryID, answers);
  if (ok) {
    res.json({ success: true, message: 'Clarification submitted' });
  } else {
    res.status(404).json({ error: 'Pending clarification request not found' });
  }
});

/** 阶段 2: 提交大纲与模板审批决定 */
apiRouter.post('/hitl/plan', (req: Request, res: Response) => {
  const { queryID, decision } = req.body;
  if (!queryID || !decision) {
    res.status(400).json({ error: 'queryID and decision are required' });
    return;
  }

  const runner = getWorkflowRunner();
  const ok = runner.submitPlanDecision(queryID, decision);
  if (ok) {
    res.json({ success: true, message: 'Plan decision submitted' });
  } else {
    res.status(404).json({ error: 'Pending plan approval request not found' });
  }
});

/** 获取任务状态快照 */
apiRouter.get('/state/:queryID', async (req: Request, res: Response) => {
  const { queryID } = req.params;
  const state = await readCheckpoint(queryID);
  if (!state) {
    res.status(404).json({ error: 'State not found' });
    return;
  }
  res.json(state);
});

/** SSE 流式事件推送通道 */
apiRouter.get('/sse', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const bus = getGlobalEventBus();
  const lastEventId = req.headers['last-event-id'] ? parseInt(req.headers['last-event-id'] as string, 10) : 0;

  // 重放断线未收到的消息
  if (lastEventId > 0) {
    const replayList = bus.replaySince(lastEventId);
    for (const msg of replayList) {
      res.write(`id: ${msg.id}\nevent: ${msg.event}\ndata: ${JSON.stringify(msg.data)}\n\n`);
    }
  }

  // 实时订阅
  const unsubscribe = bus.subscribe(msg => {
    res.write(`id: ${msg.id}\nevent: ${msg.event}\ndata: ${JSON.stringify(msg.data)}\n\n`);
  });

  // 15s 心跳保持连接
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});
