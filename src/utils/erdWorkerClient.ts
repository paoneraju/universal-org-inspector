import type { GraphBuildInput, GraphBuildResult } from '../types/erd';

export function runGraphWorker(input: GraphBuildInput): Promise<GraphBuildResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../features/erd/graphWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<GraphBuildResult>) => {
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = () => {
      worker.terminate();
      reject(new Error('Graph worker failed'));
    };
    worker.postMessage(input);
  });
}
