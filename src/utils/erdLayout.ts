import type { GraphBuildResult } from '../types/erd';
import type { ErdLayoutMode } from '../types/erd';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 40;
const LAYOUT_SPACING = 80;

export interface FlowNode {
  id: string;
  type: 'default';
  position: { x: number; y: number };
  data: { label: string; type: 'standard' | 'custom' };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: { strokeDasharray?: string };
}

/**
 * Simple layered (hierarchical) layout: edges are child->parent, so we assign
 * layers from roots (nodes that are only targets) and position by layer.
 */
function hierarchicalLayout(
  nodes: FlowNode[],
  edges: Array<{ source: string; target: string }>
): void {
  const idToNode = new Map(nodes.map((n) => [n.id, n]));
  const allIds = new Set(idToNode.keys());
  const targets = new Set(edges.map((e) => e.target));
  const roots = [...allIds].filter((id) => !targets.has(id));
  if (roots.length === 0 && nodes.length > 0) roots.push(nodes[0].id);

  const childrenOf = new Map<string, string[]>();
  for (const e of edges) {
    const list = childrenOf.get(e.target) ?? [];
    list.push(e.source);
    childrenOf.set(e.target, list);
  }

  const layer = new Map<string, number>();
  for (const r of roots) layer.set(r, 0);
  const queue = [...roots];
  let head = 0;
  while (head < queue.length) {
    const t = queue[head++];
    const tLayer = layer.get(t) ?? 0;
    for (const s of childrenOf.get(t) ?? []) {
      const cur = layer.get(s) ?? -1;
      layer.set(s, Math.max(cur, tLayer + 1));
      queue.push(s);
    }
  }
  for (const n of nodes) if (!layer.has(n.id)) layer.set(n.id, 0);

  const byLayer = new Map<number, string[]>();
  for (const [id, L] of layer) {
    const list = byLayer.get(L) ?? [];
    list.push(id);
    byLayer.set(L, list);
  }
  const maxLayer = Math.max(0, ...byLayer.keys());
  let y = 0;
  for (let L = 0; L <= maxLayer; L++) {
    const ids = byLayer.get(L) ?? [];
    const xStep = Math.max(NODE_WIDTH + LAYOUT_SPACING, (400 - NODE_WIDTH) / Math.max(1, ids.length));
    let x = 0;
    for (const id of ids) {
      const node = idToNode.get(id);
      if (node) {
        node.position = { x, y };
        x += xStep;
      }
    }
    y += NODE_HEIGHT + LAYOUT_SPACING;
  }
}

export async function layoutGraph(
  result: GraphBuildResult,
  mode: ErdLayoutMode
): Promise<{ nodes: FlowNode[]; edges: FlowEdge[] }> {
  const nodes = result.nodes.map((n) => ({
    id: n.id,
    type: 'default' as const,
    position: { x: 0, y: 0 },
    data: { label: n.label, type: n.type },
  }));
  const edges: FlowEdge[] = result.edges.map((e, i) => {
    const style =
      e.relationshipType === 'master-detail'
        ? {}
        : e.relationshipType === 'lookup'
          ? { strokeDasharray: '5 5' }
          : { strokeDasharray: '2 2' };
    return {
      id: `e-${i}-${e.source}-${e.target}-${e.label}`,
      source: e.source,
      target: e.target,
      label: e.label,
      style,
    };
  });

  if (mode === 'hierarchical' && result.nodes.length > 0) {
    hierarchicalLayout(nodes, result.edges);
  } else if (mode === 'radial' && result.nodes.length > 0) {
    const center = { x: 400, y: 300 };
    const r = Math.min(300, 2000 / result.nodes.length);
    result.nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / result.nodes.length;
      const node = nodes.find((x) => x.id === n.id);
      if (node) node.position = { x: center.x + r * Math.cos(angle), y: center.y + r * Math.sin(angle) };
    });
  } else {
    const spacing = 180;
    const cols = Math.ceil(Math.sqrt(result.nodes.length)) || 1;
    result.nodes.forEach((n, i) => {
      const node = nodes.find((x) => x.id === n.id);
      if (node) node.position = { x: (i % cols) * spacing, y: Math.floor(i / cols) * spacing };
    });
  }

  return { nodes, edges };
}
