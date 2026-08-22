/**
 * EventBus: 支持 SSE 事件广播、RingBuffer 历史缓存与 Last-Event-ID 重放
 */

import { EventEmitter } from 'node:events';

export interface SSEMessage {
  id: number;
  event: string;
  data: any;
  timestamp: number;
}

export class EventBus {
  private readonly emitter = new EventEmitter();
  private readonly buffer: SSEMessage[] = [];
  private readonly capacity: number;
  private nextId = 1;

  constructor(capacity = 2048) {
    this.capacity = capacity;
  }

  publish(event: string, data: any): SSEMessage {
    const msg: SSEMessage = {
      id: this.nextId++,
      event,
      data,
      timestamp: Date.now()
    };

    this.buffer.push(msg);
    if (this.buffer.length > this.capacity) {
      this.buffer.shift();
    }

    this.emitter.emit('message', msg);
    return msg;
  }

  subscribe(listener: (msg: SSEMessage) => void): () => void {
    this.emitter.on('message', listener);
    return () => this.emitter.off('message', listener);
  }

  replaySince(lastEventId: number): SSEMessage[] {
    return this.buffer.filter(m => m.id > lastEventId);
  }
}

let globalBus: EventBus | null = null;
export function getGlobalEventBus(): EventBus {
  if (!globalBus) {
    globalBus = new EventBus();
  }
  return globalBus;
}
