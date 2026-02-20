/**
 * Salesforce REST API types aligned with /services/data/vXX.0/sobjects and describe
 */

export interface SObjectSummary {
  name: string;
  label: string;
  custom: boolean;
  keyPrefix?: string;
  labelPlural?: string;
  layoutable?: boolean;
  activateable?: boolean;
  createable?: boolean;
  customSetting?: boolean;
  deletable?: boolean;
  deprecatedAndHidden?: boolean;
  feedEnabled?: boolean;
  hasSubtypes?: boolean;
  isSubtype?: boolean;
  searchable?: boolean;
  triggerable?: boolean;
  undeletable?: boolean;
  updateable?: boolean;
  urls?: Record<string, string>;
}

export interface SObjectListResponse {
  encoding: string;
  maxBatchSize: number;
  sobjects: SObjectSummary[];
}

export interface FieldDescribe {
  name: string;
  label: string;
  type: string;
  length?: number;
  byteLength?: number;
  precision?: number;
  scale?: number;
  soapType: string;
  custom: boolean;
  nillable: boolean;
  defaultedOnCreate: boolean;
  filterable: boolean;
  sortable: boolean;
  unique: boolean;
  caseSensitive: boolean;
  idLookup: boolean;
  namePointing: boolean;
  externalId: boolean;
  createable: boolean;
  updateable: boolean;
  deprecatedAndHidden: boolean;
  restrictedPicklist?: boolean;
  referenceTo?: string[];
  relationshipName?: string | null;
  relationshipOrder?: number | null;
  calculated?: boolean;
  calculatedFormula?: string | null;
  formula?: string | null;
  controllerName?: string | null;
  restrictedDelete?: boolean;
  cascadeDelete?: boolean;
  deleteConstraint?: string | null;
  writeRequiresMasterRead?: boolean;
  [key: string]: unknown;
}

export interface ChildRelationship {
  cascadeDelete: boolean;
  childSObject: string;
  deprecatedAndHidden: boolean;
  field: string;
  junctionIdListNames: string[];
  junctionReferenceTo: string[];
  relationshipName: string | null;
  restrictedDelete: boolean;
  [key: string]: unknown;
}

export interface SObjectDescribe {
  name: string;
  label: string;
  pluralLabel: string;
  keyPrefix?: string;
  custom: boolean;
  customSetting: boolean;
  activateable: boolean;
  createable: boolean;
  deletable: boolean;
  deprecatedAndHidden: boolean;
  feedEnabled: boolean;
  hasSubtypes: boolean;
  isSubtype: boolean;
  layoutable: boolean;
  mergeable: boolean;
  mruEnabled: boolean;
  queryable: boolean;
  replicateable: boolean;
  retrieveable: boolean;
  searchable: boolean;
  triggerable: boolean;
  undeletable: boolean;
  updateable: boolean;
  urls: Record<string, string>;
  fields: FieldDescribe[];
  childRelationships: ChildRelationship[];
  [key: string]: unknown;
}

export interface ApiVersionItem {
  label: string;
  url: string;
  version: string;
}
