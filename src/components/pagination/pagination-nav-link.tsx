import { Slot } from 'radix-ui'
import type { HTMLAttributes } from 'react'

import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type PaginationNavLinkProps = HTMLAttributes<HTMLElement> & {
  disabled?: boolean
}

export function PaginationNavLink({
  disabled = false,
  className,
  children,
  ...rest
}: PaginationNavLinkProps) {
  const baseClassName = cn(buttonVariants({ variant: 'ghost' }), className)

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(baseClassName, 'pointer-events-none opacity-50')}
        {...rest}
      >
        {children}
      </span>
    )
  }

  return (
    <Slot.Root className={baseClassName} {...rest}>
      {children}
    </Slot.Root>
  )
}
