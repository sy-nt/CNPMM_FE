import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { IdempotencyKey } from '#/lib/api/common'
import type { OrderListQuery } from '#/lib/api/order'
import {
  cancelOrder,
  getOrder,
  listOrders,
  placeOrder,
  previewCheckout,
} from '#/lib/api/order'
import { invalidateCartQueries } from '#/lib/query/cart'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { orderKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'
import type {
  CheckoutPreviewInput,
  OrderSummary,
  PlaceOrderInput,
} from '#/lib/schemas/order.schema'
import { orderSummarySchema } from '#/lib/schemas/order.schema'

export const CHECKOUT_PREVIEW_STALE_TIME_MS = 0

export type PlaceOrderMutationInput = PlaceOrderInput & {
  idempotencyKey: IdempotencyKey
}

export type CancelOrderMutationInput = {
  orderId: string
  reason: string
  idempotencyKey?: IdempotencyKey
}

export function orderListQueryOptions(
  accessToken: string,
  query: OrderListQuery,
) {
  return queryOptions({
    queryKey: orderKeys.list(accessToken, query),
    queryFn: ({ signal }) => listOrders(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function orderDetailQueryOptions(accessToken: string, orderId: string) {
  return queryOptions({
    queryKey: orderKeys.detail(accessToken, orderId),
    queryFn: async ({ signal }): Promise<OrderSummary> => {
      const raw = await getOrder(accessToken, orderId, signal)
      return orderSummarySchema.parse(raw)
    },
    staleTime: QUERY_STALE_TIME_MS,
    enabled: Boolean(orderId),
  })
}

export function invalidateOrderQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: orderKeys.all })
}

export function checkoutPreviewQueryOptions(
  accessToken: string,
  input: CheckoutPreviewInput | null,
) {
  const enabled =
    input !== null &&
    input.destinationAddressId.length > 0 &&
    input.deliveryMethodId.length > 0 &&
    input.items.length > 0

  return queryOptions({
    queryKey: orderKeys.preview(accessToken, enabled ? input : null),
    queryFn: ({ signal }) => {
      if (!input) {
        throw new Error('Checkout preview input is required.')
      }
      return previewCheckout(accessToken, input, signal)
    },
    enabled,
    staleTime: CHECKOUT_PREVIEW_STALE_TIME_MS,
    gcTime: QUERY_STALE_TIME_MS,
  })
}

export function orderMutations(accessToken: string, queryClient: QueryClient) {
  return {
    place: createMutationOptions({
      mutationKey: orderKeys.mutation('place', accessToken),
      mutationFn: (input: PlaceOrderMutationInput) =>
        placeOrder(
          accessToken,
          {
            destinationAddressId: input.destinationAddressId,
            deliveryMethodId: input.deliveryMethodId,
            expectedTotalAmount: input.expectedTotalAmount,
            items: input.items,
            claimedDiscountIds: input.claimedDiscountIds,
          },
          input.idempotencyKey,
        ),
      afterSuccess: [
        () => invalidateCartQueries(queryClient),
        () => invalidateOrderQueries(queryClient),
      ],
    }),
    cancel: createMutationOptions({
      mutationKey: orderKeys.mutation('cancel', accessToken),
      mutationFn: (input: CancelOrderMutationInput) =>
        cancelOrder(
          accessToken,
          input.orderId,
          { reason: input.reason },
          { idempotencyKey: input.idempotencyKey },
        ),
      afterSuccess: () => invalidateOrderQueries(queryClient),
    }),
  } as const
}
