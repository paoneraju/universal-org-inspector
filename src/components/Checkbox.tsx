import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const uid = id ?? `cb-${Math.random().toString(36).slice(2)}`;
  return (
    <label htmlFor={uid} className={`inline-flex items-center gap-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-300 ${className}`}>
      <input
        type="checkbox"
        id={uid}
        className="rounded border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 focus:ring-neutral-400"
        {...props}
      />
      {label}
    </label>
  );
}
