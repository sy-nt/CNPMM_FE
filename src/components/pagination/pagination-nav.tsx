import type { ReactElement, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PaginationNavLink } from '#/components/pagination/pagination-nav-link'
import { PaginationPageLink } from '#/components/pagination/pagination-page-link'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '#/components/ui/pagination'
import {
  DEFAULT_PAGINATION_VISIBLE_LIMIT,
  buildPaginationItems,
} from '#/lib/pagination'

type RenderLink = (args: {
  page: number
  content: ReactNode
  ariaLabel?: string
}) => ReactElement

type PaginationNavProps = {
  page: number
  totalPage: number
  renderLink: RenderLink
  visibleLimit?: number
  className?: string
}

export function PaginationNav({
  page,
  totalPage,
  renderLink,
  visibleLimit = DEFAULT_PAGINATION_VISIBLE_LIMIT,
  className,
}: PaginationNavProps) {
  if (totalPage <= 1) return null

  const items = buildPaginationItems(page, totalPage, visibleLimit)
  const isFirst = page <= 1
  const isLast = page >= totalPage

  const prevContent = (
    <>
      <ChevronLeft aria-hidden="true" />
      <span className="hidden sm:inline">Previous</span>
    </>
  )

  const nextContent = (
    <>
      <span className="hidden sm:inline">Next</span>
      <ChevronRight aria-hidden="true" />
    </>
  )

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationNavLink
            disabled={isFirst}
            aria-label="Go to previous page"
            className="gap-1 px-2.5"
          >
            {isFirst
              ? prevContent
              : renderLink({ page: page - 1, content: prevContent })}
          </PaginationNavLink>
        </PaginationItem>

        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationPageLink isActive={item === page}>
                {item === page
                  ? item
                  : renderLink({
                      page: item,
                      content: item,
                      ariaLabel: `Go to page ${item}`,
                    })}
              </PaginationPageLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNavLink
            disabled={isLast}
            aria-label="Go to next page"
            className="gap-1 px-2.5"
          >
            {isLast
              ? nextContent
              : renderLink({ page: page + 1, content: nextContent })}
          </PaginationNavLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
