import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  createWarehouse,
  deleteWarehouse,
  getWarehouse,
  listWarehouses,
  
  
  
  updateWarehouse
} from '#/lib/api/warehouse'
import type {CreateWarehouseInput, UpdateWarehouseInput, WarehouseListQuery} from '#/lib/api/warehouse';
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { warehouseKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export type UpdateWarehouseMutationInput = {
  warehouseId: string
  input: UpdateWarehouseInput
}

export function warehouseListQueryOptions(
  accessToken: string,
  query: WarehouseListQuery = {},
) {
  return queryOptions({
    queryKey: warehouseKeys.list(accessToken, query),
    queryFn: ({ signal }) => listWarehouses(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function warehouseDetailQueryOptions(
  accessToken: string,
  warehouseId: string,
) {
  return queryOptions({
    queryKey: warehouseKeys.detail(accessToken, warehouseId),
    queryFn: ({ signal }) => getWarehouse(accessToken, warehouseId, signal),
    staleTime: QUERY_STALE_TIME_MS,
    enabled: Boolean(warehouseId),
  })
}

export function invalidateWarehouseQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: warehouseKeys.all })
}

export function warehouseMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterWarehouseChange = (): Promise<void> =>
    invalidateWarehouseQueries(queryClient)

  return {
    create: createMutationOptions({
      mutationKey: warehouseKeys.mutation('create', accessToken),
      mutationFn: (input: CreateWarehouseInput) =>
        createWarehouse(accessToken, input),
      afterSuccess: () => afterWarehouseChange(),
    }),
    update: createMutationOptions({
      mutationKey: warehouseKeys.mutation('update', accessToken),
      mutationFn: ({ warehouseId, input }: UpdateWarehouseMutationInput) =>
        updateWarehouse(accessToken, warehouseId, input),
      afterSuccess: () => afterWarehouseChange(),
    }),
    delete: createMutationOptions({
      mutationKey: warehouseKeys.mutation('delete', accessToken),
      mutationFn: (warehouseId: string) =>
        deleteWarehouse(accessToken, warehouseId),
      afterSuccess: () => afterWarehouseChange(),
    }),
  } as const
}
