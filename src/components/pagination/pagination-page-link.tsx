import { Slot } from 'radix-ui'
import type { HTMLAttributes } from 'react'

import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type PaginationPageLinkProps = HTMLAttributes<HTMLElement> & {
  isActive?: boolean
}

export function PaginationPageLink({
  isActive = false,
  className,
  children,
  ...rest
}: PaginationPageLinkProps) {
  const composedClassName = cn(
    buttonVariants({
      variant: isActive ? 'outline' : 'ghost',
      size: 'icon',
    }),
    className,
  )

  if (isActive) {
    return (
      <span
        aria-current="page"
        data-active="true"
        className={composedClassName}
        {...rest}
      >
        {children}
      </span>
    )
  }

  return (
    <Slot.Root className={composedClassName} {...rest}>
      {children}
    </Slot.Root>
  )
}
