import { ref, onMounted, onUnmounted } from 'vue';

export function useSSE(onMessage?: (event: string, data: any) => void) {
  const isConnected = ref(false);
  let eventSource: EventSource | null = null;

  function connect() {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource('/api/sse');

    eventSource.onopen = () => {
      isConnected.value = true;
      console.log('[SSE] Connected to PPT Agent stream');
    };

    eventSource.onerror = (err) => {
      isConnected.value = false;
      console.warn('[SSE] Connection lost, reconnecting...', err);
    };

    eventSource.addEventListener('stage.enter', (e) => {
      onMessage?.('stage.enter', JSON.parse(e.data));
    });

    eventSource.addEventListener('agent.log', (e) => {
      onMessage?.('agent.log', JSON.parse(e.data));
    });

    eventSource.addEventListener('hitl.clarify_requested', (e) => {
      onMessage?.('hitl.clarify_requested', JSON.parse(e.data));
    });

    eventSource.addEventListener('hitl.plan_template_requested', (e) => {
      onMessage?.('hitl.plan_template_requested', JSON.parse(e.data));
    });

    eventSource.addEventListener('run.end', (e) => {
      onMessage?.('run.end', JSON.parse(e.data));
    });
  }

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    eventSource?.close();
  });

  return {
    isConnected,
    reconnect: connect
  };
}
