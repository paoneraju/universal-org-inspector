import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSObjectDescribe } from '../hooks/useSObjectDescribe';
import { useApiVersion } from '../hooks/useApiVersion';
import { useToast } from '../contexts/ToastContext';
import { ObjectHeader } from '../features/objects/ObjectHeader';
import { FieldsTable } from '../features/fields/FieldsTable';
import { RelationshipsTable } from '../features/relationships/RelationshipsTable';
import { ErdCanvas } from '../features/erd/ErdCanvas';
import { Tabs } from '../components/Tabs';
import type { TabItem } from '../components/Tabs';

export function ObjectView() {
  const { objectApiName } = useParams<{ objectApiName: string }>();
  const { apiVersion } = useApiVersion();
  const { describe, isLoading, error } = useSObjectDescribe(objectApiName, apiVersion);
  const { addToast } = useToast();
  const [fieldSearch, setFieldSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('fields');
  const [highlightedEdge, setHighlightedEdge] = useState<{ source: string; target: string; label: string } | null>(null);

  useEffect(() => {
    if (error) addToast(error instanceof Error ? error.message : 'Failed to load object', 'error');
  }, [error, addToast]);

  const handleSelectRelationship = useCallback((params: { source: string; target: string; label: string }) => {
    setHighlightedEdge(params);
    setActiveTab('erd');
  }, []);

  if (!objectApiName) {
    return <div className="p-4 text-neutral-500 dark:text-neutral-400">Select an object from the sidebar.</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-neutral-500 dark:text-neutral-400">Loading object…</div>;
  }

  if (error || !describe) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        {error instanceof Error ? error.message : 'Failed to load object'}
      </div>
    );
  }

  const tabs: TabItem[] = [
    {
      id: 'fields',
      label: 'Fields',
      content: (
        <FieldsTable
          fields={describe.fields}
          searchTerm={fieldSearch}
          onSearchChange={setFieldSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      ),
    },
    {
      id: 'relationships',
      label: 'Relationships',
      content: <RelationshipsTable describe={describe} onSelectRelationship={handleSelectRelationship} />,
    },
    {
      id: 'erd',
      label: 'ERD',
      content: <ErdCanvas objectApiName={objectApiName} highlightedEdge={highlightedEdge} />,
    },
    {
      id: 'raw',
      label: 'Raw JSON',
      content: (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(describe, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${objectApiName}-schema.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="py-2 px-3 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600"
            >
              Export schema JSON
            </button>
          </div>
          <pre className="p-4 overflow-auto text-xs font-mono bg-neutral-50 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 max-h-[70vh]">
            {JSON.stringify(describe, null, 2)}
          </pre>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 flex flex-col min-h-0">
      <ObjectHeader describe={describe} />
      <Tabs tabs={tabs} activeId={activeTab} onSelect={setActiveTab} className="flex-1 min-h-0 flex flex-col" />
    </div>
  );
}
