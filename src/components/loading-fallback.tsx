import { Loader2 } from 'lucide-react'

import { cn } from '#/lib/utils.ts'

type LoadingFallbackVariant = 'inline' | 'page'

type LoadingFallbackProps = {
  /** `inline` fills its container; `page` centers in a full-viewport area. */
  variant?: LoadingFallbackVariant
  /** Accessible status text. Announced to screen readers via `role="status"`. */
  label?: string
  className?: string
}

export function LoadingFallback({
  variant = 'inline',
  label = 'Loading…',
  className,
}: LoadingFallbackProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex w-full items-center justify-center gap-2 text-muted-foreground',
        variant === 'page' ? 'min-h-[60vh] text-base' : 'p-4 text-sm',
        className,
      )}
    >
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}
