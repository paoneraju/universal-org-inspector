import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
