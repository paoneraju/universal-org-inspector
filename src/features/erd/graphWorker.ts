/**
 * Web Worker: builds ERD graph from describe map. No network; receives describes from main thread.
 */

interface GraphBuildInput {
  rootObject: string;
  depth: number;
  includeStandard: boolean;
  includeCustom: boolean;
  describes: Record<string, { name: string; custom: boolean; fields: Array<{ name: string; referenceTo?: string[]; cascadeDelete?: boolean }>; childRelationships: Array<{ childSObject: string; field: string; cascadeDelete: boolean }> }>;
  maxNodes: number;
  maxEdges: number;
}

interface GraphBuildResult {
  nodes: Array<{ id: string; label: string; type: 'standard' | 'custom' }>;
  edges: Array<{ source: string; target: string; label: string; relationshipType: 'master-detail' | 'lookup' | 'polymorphic' }>;
  truncated: boolean;
}

function isStandard(name: string): boolean {
  return !name.endsWith('__c') && !name.endsWith('__x') && !name.includes('__');
}

function shouldInclude(
  objectName: string,
  includeStandard: boolean,
  includeCustom: boolean
): boolean {
  const standard = isStandard(objectName);
  if (standard && !includeStandard) return false;
  if (!standard && !includeCustom) return false;
  return true;
}

self.onmessage = (e: MessageEvent<GraphBuildInput>) => {
  const { rootObject, depth, includeStandard, includeCustom, describes, maxNodes, maxEdges } = e.data;
  const result: GraphBuildResult = { nodes: [], edges: [], truncated: false };

  const nodeSet = new Set<string>();
  const edgeSet = new Set<string>();
  const visited = new Set<string>();
  const queue: { name: string; d: number }[] = [{ name: rootObject, d: 0 }];

  const rootDescribe = describes[rootObject];
  if (!rootDescribe) {
    self.postMessage(result);
    return;
  }

  while (queue.length > 0 && nodeSet.size < maxNodes) {
    const { name, d } = queue.shift()!;
    if (visited.has(name) || d > depth) continue;
    visited.add(name);

    const desc = describes[name];
    if (!desc) continue;
    if (!shouldInclude(name, includeStandard, includeCustom)) continue;

    nodeSet.add(name);
    const kind = desc.custom ? 'custom' : 'standard';
    result.nodes.push({ id: name, label: name, type: kind });

    if (d >= depth) continue;

    for (const f of desc.fields) {
      if (result.edges.length >= maxEdges) {
        result.truncated = true;
        break;
      }
      if (!f.referenceTo?.length) continue;
      const relType = f.referenceTo.length > 1 ? 'polymorphic' : (f as { cascadeDelete?: boolean }).cascadeDelete ? 'master-detail' : 'lookup';
      for (const ref of f.referenceTo) {
        const edgeKey = `${name}-${f.name}-${ref}`;
        if (edgeSet.has(edgeKey)) continue;
        edgeSet.add(edgeKey);
        result.edges.push({ source: name, target: ref, label: f.name, relationshipType: relType });
        if (!visited.has(ref)) queue.push({ name: ref, d: d + 1 });
      }
    }
    for (const cr of desc.childRelationships) {
      if (result.edges.length >= maxEdges) {
        result.truncated = true;
        break;
      }
      const child = cr.childSObject;
      const edgeKey = `${child}-${cr.field}-${name}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);
      result.edges.push({ source: child, target: name, label: cr.field, relationshipType: cr.cascadeDelete ? 'master-detail' : 'lookup' });
      if (!visited.has(child)) queue.push({ name: child, d: d + 1 });
    }
  }

  if (queue.length > 0 || result.edges.length >= maxEdges) result.truncated = true;
  self.postMessage(result);
};
