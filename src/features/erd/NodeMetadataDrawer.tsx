import type { SObjectDescribe } from '../../types';

interface NodeMetadataDrawerProps {
  objectName: string | null;
  describe: SObjectDescribe | null;
  onClose: () => void;
}

export function NodeMetadataDrawer({ objectName, describe, onClose }: NodeMetadataDrawerProps) {
  if (!objectName) return null;
  return (
    <div className="absolute top-0 right-0 w-80 h-full border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg z-10 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">{objectName}</h3>
        <button type="button" onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">×</button>
      </div>
      <div className="p-3 overflow-auto text-sm">
        {describe ? (
          <dl className="space-y-2">
            <div><dt className="text-neutral-500 dark:text-neutral-400">Label</dt><dd className="font-medium">{describe.label}</dd></div>
            <div><dt className="text-neutral-500 dark:text-neutral-400">Type</dt><dd>{describe.custom ? 'Custom' : 'Standard'}</dd></div>
            <div><dt className="text-neutral-500 dark:text-neutral-400">Fields</dt><dd>{describe.fields?.length ?? 0}</dd></div>
            <div><dt className="text-neutral-500 dark:text-neutral-400">Child relationships</dt><dd>{describe.childRelationships?.length ?? 0}</dd></div>
          </dl>
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400">No metadata loaded for this node.</p>
        )}
      </div>
    </div>
  );
}
