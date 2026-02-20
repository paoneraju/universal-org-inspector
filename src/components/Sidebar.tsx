import type { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className = '' }: SidebarProps) {
  return (
    <aside
      className={`w-64 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col overflow-hidden shrink-0 ${className}`}
    >
      {children}
    </aside>
  );
}
