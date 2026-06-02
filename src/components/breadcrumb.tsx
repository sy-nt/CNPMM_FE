import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { cn } from '#/lib/utils'

export type BreadcrumbItem = {
  label: ReactNode
  linkProps?: LinkProps
}

type BreadcrumbProps = {
  items: ReadonlyArray<BreadcrumbItem>
  separator?: ReactNode
  className?: string
}

const _defaultSeparator: ReactNode = (
  <ChevronRight aria-hidden="true" className="size-3.5 text-muted-foreground" />
)

export function Breadcrumb({
  items,
  separator = _defaultSeparator,
  className,
}: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('w-full', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const key = `${index}-${typeof item.label === 'string' ? item.label : index}`
          return (
            <Fragment key={key}>
              <li className="flex items-center">
                {isLast || !item.linkProps ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(
                      'truncate',
                      isLast
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    {...item.linkProps}
                    className="truncate text-muted-foreground no-underline hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {isLast ? null : (
                <li aria-hidden="true" className="flex items-center">
                  {separator}
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
