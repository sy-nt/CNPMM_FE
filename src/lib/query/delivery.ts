import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { DeliveryListQuery } from '#/lib/api/delivery'
import {
  listDeliveries,
  listDeliveryMethods,
  updateDeliveryStatus,
} from '#/lib/api/delivery'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { deliveryKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export type UpdateDeliveryStatusMutationInput = {
  deliveryId: string
  status: string
  trackingCode?: string
  notes?: string
}

export function deliveryListQueryOptions(
  accessToken: string,
  query: DeliveryListQuery,
) {
  return queryOptions({
    queryKey: deliveryKeys.list(accessToken, query),
    queryFn: ({ signal }) => listDeliveries(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function deliveryMethodsQueryOptions(accessToken: string) {
  return queryOptions({
    queryKey: deliveryKeys.methods(accessToken),
    queryFn: ({ signal }) => listDeliveryMethods(accessToken, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function invalidateDeliveryQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
}

export function deliveryMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  return {
    updateStatus: createMutationOptions({
      mutationKey: deliveryKeys.mutation('update-status', accessToken),
      mutationFn: (input: UpdateDeliveryStatusMutationInput) =>
        updateDeliveryStatus(
          accessToken,
          input.deliveryId,
          {
            status: input.status,
            trackingCode: input.trackingCode,
            notes: input.notes,
          },
        ),
      afterSuccess: () => invalidateDeliveryQueries(queryClient),
    }),
  } as const
}
