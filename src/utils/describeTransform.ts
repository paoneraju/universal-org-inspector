import type { SObjectDescribe, FieldDescribe, ChildRelationship } from '../types';

/**
 * Parent relationship: field on this object that references another object
 */
export interface ParentRelationshipRow {
  fieldName: string;
  referencedObject: string;
  relationshipName: string | null;
  isMasterDetail: boolean;
}

/**
 * Child relationship: child object and the field that points to this object
 */
export interface ChildRelationshipRow {
  childSObject: string;
  fieldName: string;
  relationshipName: string | null;
  cascadeDelete: boolean;
}

export function getParentRelationships(describe: SObjectDescribe): ParentRelationshipRow[] {
  const out: ParentRelationshipRow[] = [];
  for (const f of describe.fields) {
    if (f.referenceTo?.length) {
      const isMD = Boolean((f as FieldDescribe & { cascadeDelete?: boolean }).cascadeDelete);
      for (const ref of f.referenceTo) {
        out.push({
          fieldName: f.name,
          referencedObject: ref,
          relationshipName: f.relationshipName ?? null,
          isMasterDetail: isMD,
        });
      }
    }
  }
  return out;
}

export function getChildRelationships(describe: SObjectDescribe): ChildRelationshipRow[] {
  return describe.childRelationships.map((cr: ChildRelationship) => ({
    childSObject: cr.childSObject,
    fieldName: cr.field,
    relationshipName: cr.relationshipName,
    cascadeDelete: cr.cascadeDelete,
  }));
}

function isMasterDetail(field: FieldDescribe): boolean {
  return Boolean((field as FieldDescribe & { cascadeDelete?: boolean }).cascadeDelete);
}

/**
 * Build edges for ERD: child -> parent, label = relationship field
 */
export function describeToEdges(describe: SObjectDescribe, sourceObject: string): Array<{ source: string; target: string; label: string; relationshipType: 'master-detail' | 'lookup' | 'polymorphic' }> {
  const edges: Array<{ source: string; target: string; label: string; relationshipType: 'master-detail' | 'lookup' | 'polymorphic' }> = [];
  for (const f of describe.fields) {
    if (!f.referenceTo?.length) continue;
    const relType = f.referenceTo.length > 1 ? 'polymorphic' : isMasterDetail(f) ? 'master-detail' : 'lookup';
    for (const ref of f.referenceTo) {
      edges.push({
        source: sourceObject,
        target: ref,
        label: f.name,
        relationshipType: relType,
      });
    }
  }
  return edges;
}
