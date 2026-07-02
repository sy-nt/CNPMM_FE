import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  getCategory,
  listCategories,
  resolveCategoryBySlug,
} from '#/lib/api/category'
import type { CategoryListQuery, CategoryTreeQuery } from '#/lib/api/category'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { categoryKeys } from '#/lib/query/keys'
import type { Maybe } from '#/lib/types'

export function categoryListQueryOptions(
  accessToken: Maybe<string>,
  query: CategoryListQuery,
) {
  return queryOptions({
    queryKey: categoryKeys.list(accessToken ?? null, query),
    queryFn: ({ signal }) => listCategories(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function categoryTreeQueryOptions(
  accessToken: Maybe<string>,
  categoryId: string,
  query: CategoryTreeQuery,
) {
  return queryOptions({
    queryKey: categoryKeys.tree(accessToken ?? null, categoryId, query),
    queryFn: ({ signal }) => getCategory(accessToken, categoryId, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function categoryBySlugQueryOptions(
  accessToken: Maybe<string>,
  slug: string,
) {
  return queryOptions({
    queryKey: categoryKeys.bySlug(accessToken ?? null, slug),
    queryFn: ({ signal }) => resolveCategoryBySlug(accessToken, slug, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function invalidateCategoryQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: categoryKeys.all })
}
