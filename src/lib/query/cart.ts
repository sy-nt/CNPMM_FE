import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from '#/lib/api/cart'
import type {
  AddCartItemInput,
  UpdateCartItemQuantityInput,
} from '#/lib/api/cart'
import type { IdempotencyKey } from '#/lib/api/common'
import {
  CART_BADGE_MAX_COUNT,
  QUERY_STALE_TIME_MS,
} from '#/lib/query/constants'
import { cartKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'
import type { Cart } from '#/lib/schemas/cart.schema'

export type AddCartItemMutationInput = AddCartItemInput & {
  idempotencyKey?: IdempotencyKey
}

export type UpdateCartItemQuantityMutationInput = {
  skuId: string
  input: UpdateCartItemQuantityInput
}

export function cartQueryOptions(accessToken: string) {
  return queryOptions({
    queryKey: cartKeys.detail(accessToken),
    queryFn: ({ signal }) => getCart(accessToken, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function invalidateCartQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: cartKeys.all })
}

export function cartMutations(accessToken: string, queryClient: QueryClient) {
  const afterCartChange = (): Promise<void> => invalidateCartQueries(queryClient)

  return {
    addItem: createMutationOptions({
      mutationKey: cartKeys.mutation('add', accessToken),
      mutationFn: (input: AddCartItemMutationInput) =>
        addCartItem(
          accessToken,
          { skuId: input.skuId, quantity: input.quantity },
          { idempotencyKey: input.idempotencyKey },
        ),
      afterSuccess: afterCartChange,
    }),
    updateQuantity: createMutationOptions({
      mutationKey: cartKeys.mutation('update', accessToken),
      mutationFn: ({ skuId, input }: UpdateCartItemQuantityMutationInput) =>
        updateCartItemQuantity(accessToken, skuId, input),
      afterSuccess: afterCartChange,
    }),
    removeItem: createMutationOptions({
      mutationKey: cartKeys.mutation('remove', accessToken),
      mutationFn: (skuId: string) => removeCartItem(accessToken, skuId),
      afterSuccess: afterCartChange,
    }),
    clear: createMutationOptions({
      mutationKey: cartKeys.mutation('clear', accessToken),
      mutationFn: () => clearCart(accessToken),
      afterSuccess: afterCartChange,
    }),
  } as const
}

export function countCartItems(cart: Cart | undefined): number {
  if (!cart) return 0
  if (cart.totalItems !== undefined) return cart.totalItems
  return cart.items.reduce((acc, item) => acc + item.quantity, 0)
}

export function formatCartBadgeCount(count: number): string {
  return count > CART_BADGE_MAX_COUNT
    ? `${CART_BADGE_MAX_COUNT}+`
    : String(count)
}
