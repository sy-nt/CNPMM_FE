export type PageItem = number | 'ellipsis'

export const DEFAULT_PAGINATION_VISIBLE_LIMIT = 7

export function buildPaginationItems(
  current: number,
  total: number,
  visibleLimit: number = DEFAULT_PAGINATION_VISIBLE_LIMIT,
): ReadonlyArray<PageItem> {
  if (total <= visibleLimit) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: Array<PageItem> = [1]

  const showLeftEllipsis = current > 3
  const showRightEllipsis = current < total - 2

  if (showLeftEllipsis) items.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let p = start; p <= end; p++) items.push(p)

  if (showRightEllipsis) items.push('ellipsis')

  items.push(total)
  return items
}
