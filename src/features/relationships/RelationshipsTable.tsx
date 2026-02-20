import { getParentRelationships, getChildRelationships, type ParentRelationshipRow, type ChildRelationshipRow } from '../../utils/describeTransform';
import type { SObjectDescribe } from '../../types';

interface RelationshipsTableProps {
  describe: SObjectDescribe;
  onSelectRelationship?: (params: { source: string; target: string; label: string }) => void;
}

export function RelationshipsTable({ describe, onSelectRelationship }: RelationshipsTableProps) {
  const parents = getParentRelationships(describe);
  const children = getChildRelationships(describe);

  const handleParentClick = (row: ParentRelationshipRow) => {
    onSelectRelationship?.({ source: describe.name, target: row.referencedObject, label: row.fieldName });
  };

  const handleChildClick = (row: ChildRelationshipRow) => {
    onSelectRelationship?.({ source: row.childSObject, target: describe.name, label: row.fieldName });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Parent relationships</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Field on this object → referenced object</p>
        <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="text-left p-2 font-medium">Field</th>
                <th className="text-left p-2 font-medium">Referenced object</th>
                <th className="text-left p-2 font-medium">Relationship name</th>
                <th className="text-left p-2 font-medium">Master-detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {parents.length === 0 ? (
                <tr><td colSpan={4} className="p-2 text-neutral-500">None</td></tr>
              ) : (
                parents.map((row) => (
                  <tr
                    key={`${row.fieldName}-${row.referencedObject}`}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                    onClick={() => handleParentClick(row)}
                  >
                    <td className="p-2 font-mono">{row.fieldName}</td>
                    <td className="p-2 font-mono">{row.referencedObject}</td>
                    <td className="p-2 font-mono text-neutral-600 dark:text-neutral-400">{row.relationshipName ?? '—'}</td>
                    <td className="p-2">{row.isMasterDetail ? 'Yes' : 'No'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Child relationships</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Child object → relationship field</p>
        <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="text-left p-2 font-medium">Child object</th>
                <th className="text-left p-2 font-medium">Relationship field</th>
                <th className="text-left p-2 font-medium">Cascade delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {children.length === 0 ? (
                <tr><td colSpan={3} className="p-2 text-neutral-500">None</td></tr>
              ) : (
                children.map((row) => (
                  <tr
                    key={`${row.childSObject}-${row.fieldName}`}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                    onClick={() => handleChildClick(row)}
                  >
                    <td className="p-2 font-mono">{row.childSObject}</td>
                    <td className="p-2 font-mono">{row.fieldName}</td>
                    <td className="p-2">{row.cascadeDelete ? 'Yes' : 'No'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
