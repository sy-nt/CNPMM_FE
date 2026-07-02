import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  adjustInventory,
  getInventoryBySku,
  getInventoryByWarehouse,
  
  
  
  setInventory
} from '#/lib/api/inventory'
import type {AdjustInventoryInput, InventoryByWarehouseQuery, SetInventoryInput} from '#/lib/api/inventory';
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { inventoryKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export type SetInventoryMutationInput = {
  skuId: string
  warehouseId: string
  input: SetInventoryInput
}

export type AdjustInventoryMutationInput = {
  skuId: string
  warehouseId: string
  input: AdjustInventoryInput
}

export function inventoryBySkuQueryOptions(
  accessToken: string,
  skuId: string,
) {
  return queryOptions({
    queryKey: inventoryKeys.bySku(accessToken, skuId),
    queryFn: ({ signal }) => getInventoryBySku(accessToken, skuId, signal),
    staleTime: QUERY_STALE_TIME_MS,
    enabled: Boolean(skuId),
  })
}

export function inventoryByWarehouseQueryOptions(
  accessToken: string,
  warehouseId: string,
  query: InventoryByWarehouseQuery = {},
) {
  return queryOptions({
    queryKey: inventoryKeys.byWarehouse(accessToken, warehouseId, query),
    queryFn: ({ signal }) =>
      getInventoryByWarehouse(accessToken, warehouseId, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
    enabled: Boolean(warehouseId),
  })
}

export function invalidateInventoryQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
}

export function inventoryMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterInventoryChange = (): Promise<void> =>
    invalidateInventoryQueries(queryClient)

  return {
    set: createMutationOptions({
      mutationKey: inventoryKeys.mutation('set', accessToken),
      mutationFn: ({ skuId, warehouseId, input }: SetInventoryMutationInput) =>
        setInventory(accessToken, skuId, warehouseId, input),
      afterSuccess: () => afterInventoryChange(),
    }),
    adjust: createMutationOptions({
      mutationKey: inventoryKeys.mutation('adjust', accessToken),
      mutationFn: ({
        skuId,
        warehouseId,
        input,
      }: AdjustInventoryMutationInput) =>
        adjustInventory(accessToken, skuId, warehouseId, input),
      afterSuccess: () => afterInventoryChange(),
    }),
  } as const
}
