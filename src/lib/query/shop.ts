import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  assignShopWorker,
  getShop,
  listAdminShops,
  listShopWorkers,
  listShops,
  unassignShopWorker,
} from '#/lib/api/shop'
import type { AdminShopListQuery, ShopListQuery } from '#/lib/api/shop'
import type {
  AssignShopWorkerInput,
  UnassignShopWorkerInput,
} from '#/lib/schemas/shop-worker.schema'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { shopKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'
import type { Maybe } from '#/lib/types'

export function shopListQueryOptions(
  accessToken: Maybe<string>,
  query: ShopListQuery,
) {
  return queryOptions({
    queryKey: shopKeys.list(accessToken ?? null, query),
    queryFn: ({ signal }) => listShops(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function adminShopListQueryOptions(
  accessToken: string,
  query: AdminShopListQuery,
) {
  return queryOptions({
    queryKey: shopKeys.adminList(accessToken, query),
    queryFn: ({ signal }) => listAdminShops(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function shopDetailQueryOptions(
  accessToken: Maybe<string>,
  idOrSlug: string,
) {
  return queryOptions({
    queryKey: shopKeys.detail(accessToken ?? null, idOrSlug),
    queryFn: ({ signal }) => getShop(accessToken, idOrSlug, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function shopWorkersQueryOptions(accessToken: string) {
  return queryOptions({
    queryKey: shopKeys.workers(accessToken),
    queryFn: ({ signal }) => listShopWorkers(accessToken, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function shopWorkerMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterWorkersChange = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: shopKeys.workers(accessToken),
    })
  }

  return {
    assign: createMutationOptions({
      mutationKey: shopKeys.mutation('assign-worker', accessToken),
      mutationFn: (input: AssignShopWorkerInput) =>
        assignShopWorker(accessToken, input),
      afterSuccess: () => {
        void afterWorkersChange()
      },
    }),
    unassign: createMutationOptions({
      mutationKey: shopKeys.mutation('unassign-worker', accessToken),
      mutationFn: (input: UnassignShopWorkerInput) =>
        unassignShopWorker(accessToken, input),
      afterSuccess: () => {
        void afterWorkersChange()
      },
    }),
  } as const
}

export function invalidateShopQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: shopKeys.all })
}
