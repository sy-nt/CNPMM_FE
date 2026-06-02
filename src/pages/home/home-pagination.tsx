import { Link } from '@tanstack/react-router'

import { PaginationNav } from '#/components/pagination/pagination-nav'

type HomePaginationProps = {
  page: number
  totalPage: number
  search: string | undefined
  categorySlug: string | undefined
}

export function HomePagination({
  page,
  totalPage,
  search,
  categorySlug,
}: HomePaginationProps) {
  return (
    <PaginationNav
      page={page}
      totalPage={totalPage}
      renderLink={({ page: targetPage, content, ariaLabel }) => (
        <Link
          to="/"
          search={{ search, category: categorySlug, page: targetPage }}
          aria-label={ariaLabel}
        >
          {content}
        </Link>
      )}
    />
  )
}
