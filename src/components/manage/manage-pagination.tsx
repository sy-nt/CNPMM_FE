import type { ReactNode } from 'react'

import { PaginationNav } from '#/components/pagination/pagination-nav'

type ManagePaginationProps = {
  page: number
  totalPage: number
  onPageChange: (page: number) => void
  className?: string
}

export function ManagePagination({
  page,
  totalPage,
  onPageChange,
  className,
}: ManagePaginationProps): ReactNode {
  return (
    <PaginationNav
      page={page}
      totalPage={totalPage}
      className={className}
      renderLink={({ page: targetPage, content, ariaLabel }) => (
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={() => onPageChange(targetPage)}
        >
          {content}
        </button>
      )}
    />
  )
}
