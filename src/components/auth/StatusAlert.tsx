import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type StatusAlertProps = {
  children: ReactNode
  tone?: 'danger' | 'info' | 'success'
}

const tones = {
  danger:
    'border-red-500/25 bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-100',
  info: 'border-circuit/25 bg-circuit/10 text-ink dark:text-paper',
  success:
    'border-circuit/25 bg-circuit/15 text-circuit dark:bg-circuit/20 dark:text-cream',
}

export function StatusAlert({ children, tone = 'info' }: StatusAlertProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm font-semibold',
        tones[tone],
      )}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
