import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'

type PaginatedItems<T> = {
  items: ReadonlyArray<T>
  totalPage: number
  page: number
}

export function paginateItems<T>(
  items: ReadonlyArray<T>,
  page: number,
  pageSize: number = MANAGE_TABLE_PAGE_SIZE,
): PaginatedItems<T> {
  if (items.length === 0) {
    return { items, totalPage: 1, page: 1 }
  }

  const totalPage = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPage)
  const start = (safePage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    totalPage,
    page: safePage,
  }
}
