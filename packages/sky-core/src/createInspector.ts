import { createWebSocketInspector } from '@statelyai/inspect';
export function createInspector(options: { apiKey: string }) {
  return createWebSocketInspector({
    url: `wss://api.stately.ai/inspect/${options.apiKey}`,
  });
}
