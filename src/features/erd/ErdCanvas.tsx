import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  getRectOfNodes,
  getTransformForBounds,
} from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import 'reactflow/dist/style.css';
import { useErdGraph } from '../../hooks/useErdGraph';
import { useApiVersion } from '../../hooks/useApiVersion';
import { useSObjectDescribe } from '../../hooks/useSObjectDescribe';
import { GraphControls } from './GraphControls';
import { NodeMetadataDrawer } from './NodeMetadataDrawer';
import type { ErdLayoutMode } from '../../types/erd';
import { useToast } from '../../contexts/ToastContext';

interface ErdCanvasProps {
  objectApiName: string;
  highlightedEdge?: { source: string; target: string; label: string } | null;
}

export function ErdCanvas({ objectApiName, highlightedEdge }: ErdCanvasProps) {
  const { apiVersion } = useApiVersion();
  const [depth, setDepth] = useState(2);
  const [includeStandard, setIncludeStandard] = useState(true);
  const [includeCustom, setIncludeCustom] = useState(true);
  const [layout, setLayout] = useState<ErdLayoutMode>('hierarchical');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { addToast } = useToast();

  const { nodes: flowNodes, edges: flowEdges, isLoading, error, truncated } = useErdGraph(objectApiName, apiVersion, {
    depth,
    includeStandard,
    includeCustom,
    layout,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges as Edge[]);

  useEffect(() => {
    setNodes(flowNodes as Node[]);
    setEdges(
      flowEdges.map((e) => ({
        ...e,
        animated: Boolean(highlightedEdge && e.source === highlightedEdge.source && e.target === highlightedEdge.target && e.label === highlightedEdge.label),
      })) as Edge[]
    );
  }, [flowNodes, flowEdges, highlightedEdge, setNodes, setEdges]);

  const selectedDescribe = useSObjectDescribe(selectedNodeId ?? undefined, apiVersion);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  const handleExportPng = useCallback(() => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    const bounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(bounds, 800, 600, 0.5, 2);
    toPng(el, { backgroundColor: '#fff', width: 800, height: 600, style: { transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})` } })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `erd-${objectApiName}.png`;
        a.click();
        addToast('PNG exported', 'success');
      })
      .catch(() => addToast('Export failed', 'error'));
  }, [nodes, objectApiName, addToast]);

  const handleExportSvg = useCallback(() => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    toSvg(el, { backgroundColor: '#fff' })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `erd-${objectApiName}.svg`;
        a.click();
        addToast('SVG exported', 'success');
      })
      .catch(() => addToast('Export failed', 'error'));
  }, [objectApiName, addToast]);

  const handleExportJson = useCallback(() => {
    const payload = { objectApiName, depth, includeStandard, includeCustom, nodes, edges };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erd-${objectApiName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('JSON exported', 'success');
  }, [objectApiName, depth, includeStandard, includeCustom, nodes, edges, addToast]);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">Building graph…</div>;
  if (error) return <div className="p-4 text-red-600 dark:text-red-400">{(error as Error).message}</div>;

  return (
    <div className="flex flex-col h-full relative">
      <GraphControls
        depth={depth}
        onDepthChange={setDepth}
        includeStandard={includeStandard}
        onIncludeStandardChange={setIncludeStandard}
        includeCustom={includeCustom}
        onIncludeCustomChange={setIncludeCustom}
        layout={layout}
        onLayoutChange={setLayout}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onExportJson={handleExportJson}
        truncated={truncated}
      />
      <div className="flex-1 min-h-[400px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        <NodeMetadataDrawer
          objectName={selectedNodeId}
          describe={selectedDescribe.describe}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
