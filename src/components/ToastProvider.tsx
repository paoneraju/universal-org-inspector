import { useToast } from '../contexts/ToastContext';

function ToastList() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`rounded-lg border px-4 py-3 shadow-lg text-sm ${
            t.variant === 'error'
              ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : t.variant === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
          }`}
        >
          <div className="flex justify-between items-start gap-2">
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 shrink-0"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastContainer() {
  return <ToastList />;
}
