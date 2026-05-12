import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function FormField({ className, id, label, ...props }: FormFieldProps) {
  const inputId = id ?? props.name ?? label

  return (
    <label className="grid gap-2 text-sm font-semibold text-ink dark:text-paper">
      <span>{label}</span>
      <input
        className={cn(
          'min-h-12 rounded-2xl border border-ink/15 bg-white/75 px-4 text-base text-ink outline-none transition focus:border-copper focus:ring-4 focus:ring-copper/20 dark:border-paper/15 dark:bg-paper/10 dark:text-paper dark:placeholder:text-paper/45',
          className,
        )}
        id={inputId}
        {...props}
      />
    </label>
  )
}
