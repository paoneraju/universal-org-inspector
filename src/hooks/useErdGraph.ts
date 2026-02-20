import { useQuery, useQueryClient } from '@tanstack/react-query';
import { describeSObject } from '../api/salesforceClient';
import { setApiVersion } from '../api/salesforceClient';
import type { SObjectDescribe } from '../types';
import { runGraphWorker } from '../utils/erdWorkerClient';
import { layoutGraph } from '../utils/erdLayout';
import type { ErdLayoutMode } from '../types/erd';

const MAX_NODES = 500;
const MAX_EDGES = 1000;

async function loadDescribes(
  rootObject: string,
  depth: number,
  apiVersion: string,
  queryClient: ReturnType<typeof useQueryClient>
): Promise<Record<string, SObjectDescribe>> {
  setApiVersion(apiVersion);
  const describes: Record<string, SObjectDescribe> = {};
  const queue: { name: string; d: number }[] = [{ name: rootObject, d: 0 }];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const { name, d } = queue.shift()!;
    if (seen.has(name) || d > depth) continue;
    seen.add(name);

    const desc = await queryClient.fetchQuery({
      queryKey: ['describe', apiVersion, name],
      queryFn: () => describeSObject(apiVersion, name),
    });
    describes[name] = desc;

    if (d >= depth) continue;
    for (const f of desc.fields) {
      if (f.referenceTo) for (const r of f.referenceTo) if (!seen.has(r)) queue.push({ name: r, d: d + 1 });
    }
    for (const cr of desc.childRelationships) {
      if (!seen.has(cr.childSObject)) queue.push({ name: cr.childSObject, d: d + 1 });
    }
  }
  return describes;
}

export interface UseErdGraphOptions {
  depth: number;
  includeStandard: boolean;
  includeCustom: boolean;
  layout: ErdLayoutMode;
}

export function useErdGraph(
  objectApiName: string | undefined,
  apiVersion: string,
  options: UseErdGraphOptions
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['erd', objectApiName, apiVersion, options.depth, options.includeStandard, options.includeCustom, options.layout],
    queryFn: async () => {
      if (!objectApiName) return { nodes: [], edges: [], truncated: false };
      const describes = await loadDescribes(objectApiName, options.depth, apiVersion, queryClient);
      const result = await runGraphWorker({
        rootObject: objectApiName,
        depth: options.depth,
        includeStandard: options.includeStandard,
        includeCustom: options.includeCustom,
        describes,
        maxNodes: MAX_NODES,
        maxEdges: MAX_EDGES,
      });
      const { nodes, edges } = await layoutGraph(result, options.layout);
      return { nodes, edges, truncated: result.truncated };
    },
    enabled: Boolean(objectApiName) && Boolean(apiVersion),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    nodes: query.data?.nodes ?? [],
    edges: query.data?.edges ?? [],
    truncated: query.data?.truncated ?? false,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
