export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 30,
  SORT: 'desc',
} as const

export type PaginationSort = 'asc' | 'desc'

export type PaginationQuery<TOrderBy extends string = string> = {
  page?: number
  limit?: number
  sort?: PaginationSort
  orderBy?: TOrderBy
}

export type IdempotencyKey = string

export const IDEMPOTENCY_HEADER = 'Idempotency-Key'

export function buildIdempotencyHeaders(
  key: IdempotencyKey | undefined,
): Record<string, string> | undefined {
  if (!key) return undefined
  return { [IDEMPOTENCY_HEADER]: key }
}
