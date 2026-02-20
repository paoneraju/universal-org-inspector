import type { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onSelect, className = '' }: TabsProps) {
  return (
    <div className={className}>
      <div className="flex border-b border-neutral-200 dark:border-neutral-700 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`py-2 px-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeId === tab.id
                ? 'border-neutral-800 dark:border-neutral-200 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tabs.find((t) => t.id === activeId)?.content}
      </div>
    </div>
  );
}
