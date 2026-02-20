/**
 * ERD graph types for React Flow and worker
 */

export type ErdLayoutMode = 'hierarchical' | 'radial' | 'force';

export type NodeTypeKind = 'standard' | 'custom';

export interface GraphNodeData {
  label: string;
  type: NodeTypeKind;
  objectApiName: string;
}

export interface GraphEdgeData {
  label: string;
  relationshipType: 'master-detail' | 'lookup' | 'polymorphic';
}

export interface GraphBuildInput {
  rootObject: string;
  depth: number;
  includeStandard: boolean;
  includeCustom: boolean;
  describes: Record<string, import('./salesforce').SObjectDescribe>;
  maxNodes: number;
  maxEdges: number;
}

export interface GraphBuildResult {
  nodes: Array<{ id: string; label: string; type: NodeTypeKind }>;
  edges: Array<{ source: string; target: string; label: string; relationshipType: 'master-detail' | 'lookup' | 'polymorphic' }>;
  nodePositions?: Record<string, { x: number; y: number }>;
  truncated: boolean;
}
