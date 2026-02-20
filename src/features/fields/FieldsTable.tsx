import { useMemo, useState } from 'react';
import type { FieldDescribe } from '../../types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { useToast } from '../../contexts/ToastContext';
import { copyToClipboard } from '../../utils/copyToClipboard';

interface FieldsTableProps {
  fields: FieldDescribe[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
}

type SortKey = 'label' | 'name' | 'type' | 'required' | 'length';
const typeOptions = [
  { value: '', label: 'All types' },
  ...['string', 'boolean', 'int', 'double', 'date', 'datetime', 'reference', 'picklist', 'multipicklist', 'textarea', 'url', 'email', 'phone', 'id', 'currency', 'percent', 'address', 'compound', 'calculated', 'formula'].map((t) => ({ value: t, label: t })),
];

export function FieldsTable({
  fields,
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: FieldsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('label');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    let list = fields;
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          (f.label && f.label.toLowerCase().includes(term))
      );
    }
    if (typeFilter) {
      list = list.filter((f) => f.type === typeFilter);
    }
    return list;
  }, [fields, searchTerm, typeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortKey) {
        case 'label':
          aVal = a.label ?? '';
          bVal = b.label ?? '';
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'required':
          aVal = a.nillable ? 0 : 1;
          bVal = b.nillable ? 0 : 1;
          break;
        case 'length':
          aVal = a.length ?? 0;
          bVal = b.length ?? 0;
          break;
      }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleCopy = async (name: string) => {
    const ok = await copyToClipboard(name);
    addToast(ok ? 'Copied API name' : 'Copy failed', ok ? 'success' : 'error');
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else setSortKey(key);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search fields…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th className="text-left p-2 font-medium text-neutral-700 dark:text-neutral-300 w-8" />
              <th className="text-left p-2 font-medium cursor-pointer" onClick={() => toggleSort('label')}>Label</th>
              <th className="text-left p-2 font-medium cursor-pointer" onClick={() => toggleSort('name')}>API Name</th>
              <th className="text-left p-2 font-medium cursor-pointer" onClick={() => toggleSort('type')}>Type</th>
              <th className="text-left p-2 font-medium cursor-pointer" onClick={() => toggleSort('required')}>Required</th>
              <th className="text-left p-2 font-medium cursor-pointer" onClick={() => toggleSort('length')}>Length</th>
              <th className="text-left p-2 font-medium">Reference To</th>
              <th className="text-left p-2 font-medium">Formula</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {sorted.map((f) => (
              <>
                <tr key={f.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => setExpandedName(expandedName === f.name ? null : f.name)}
                      className="text-neutral-500"
                    >
                      {expandedName === f.name ? '−' : '+'}
                    </button>
                  </td>
                  <td className="p-2 text-neutral-900 dark:text-neutral-100">{f.label}</td>
                  <td className="p-2 font-mono text-neutral-800 dark:text-neutral-200">{f.name}</td>
                  <td className="p-2 text-neutral-700 dark:text-neutral-300">{f.type}</td>
                  <td className="p-2">{f.nillable ? 'No' : 'Yes'}</td>
                  <td className="p-2">{f.length ?? '—'}</td>
                  <td className="p-2 font-mono text-xs">{f.referenceTo?.join(', ') ?? '—'}</td>
                  <td className="p-2 max-w-[200px] truncate" title={f.calculatedFormula ?? f.formula ?? undefined}>
                    {f.calculatedFormula || f.formula ? 'Yes' : '—'}
                  </td>
                  <td className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(f.name)}>
                      Copy
                    </Button>
                  </td>
                </tr>
                {expandedName === f.name && (
                  <tr key={`${f.name}-meta`} className="bg-neutral-50 dark:bg-neutral-800/50">
                    <td colSpan={9} className="p-3 text-xs font-mono text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap break-all">
                      {[
                        f.calculatedFormula && `Formula: ${f.calculatedFormula}`,
                        f.formula && `Formula (alt): ${f.formula}`,
                        f.helpText && `Help: ${f.helpText}`,
                        f.defaultValueFormula && `Default: ${f.defaultValueFormula}`,
                      ]
                        .filter(Boolean)
                        .join('\n') || 'No extra metadata'}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
