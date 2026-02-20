import type { SObjectDescribe } from '../../types';

interface ObjectHeaderProps {
  describe: SObjectDescribe;
}

export function ObjectHeader({ describe }: ObjectHeaderProps) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{describe.label}</h2>
          <p className="text-sm font-mono text-neutral-600 dark:text-neutral-400">{describe.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              describe.custom ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {describe.custom ? 'Custom' : 'Standard'}
          </span>
          {describe.queryable && (
            <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
              Queryable
            </span>
          )}
          {describe.createable && (
            <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
              Createable
            </span>
          )}
          {describe.deprecatedAndHidden && (
            <span className="px-2 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              Deprecated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
