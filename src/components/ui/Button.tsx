import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type ButtonVariant = 'ghost' | 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  isLoading?: boolean
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  ghost:
    'border-transparent bg-transparent text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10',
  primary:
    'border-ink bg-ink text-paper shadow-[0_14px_35px_rgb(57_48_40/0.25)] hover:bg-copper dark:border-copper dark:bg-copper dark:text-ink dark:hover:bg-cream',
  secondary:
    'border-ink/15 bg-paper/75 text-ink hover:bg-white dark:border-paper/15 dark:bg-paper/10 dark:text-paper dark:hover:bg-paper/15',
}

export function Button({
  children,
  className,
  disabled,
  isLoading,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  )
}
