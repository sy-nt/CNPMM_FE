import { invalidateCacheByPrefix, withCache } from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import { buildIdempotencyHeaders } from '#/lib/api/common'
import type { IdempotencyKey } from '#/lib/api/common'
import { cartSchema } from '#/lib/schemas/cart.schema'
import type { Cart } from '#/lib/schemas/cart.schema'

const CART_CACHE_PREFIX = 'cart:'

export type AddCartItemInput = {
  skuId: string
  quantity: number
}

export type UpdateCartItemQuantityInput = {
  quantity: number
}

export function getCart(
  accessToken: string,
  signal?: AbortSignal,
): Promise<Cart> {
  return withCache(
    { key: `${CART_CACHE_PREFIX}${accessToken}` },
    async (innerSignal) => {
      const data = await apiRequest<unknown>('/cart/', {
        method: 'GET',
        accessToken,
        signal: innerSignal,
      })
      return cartSchema.parse(data)
    },
    signal,
  )
}

export function invalidateCart(): void {
  invalidateCacheByPrefix(CART_CACHE_PREFIX)
}

export function clearCart(
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/cart/', { method: 'DELETE', accessToken, signal })
}

export function addCartItem(
  accessToken: string,
  input: AddCartItemInput,
  options: { idempotencyKey?: IdempotencyKey; signal?: AbortSignal } = {},
): Promise<unknown> {
  return apiRequest('/cart/items', {
    method: 'POST',
    accessToken,
    body: input,
    headers: buildIdempotencyHeaders(options.idempotencyKey),
    signal: options.signal,
  })
}

export function updateCartItemQuantity(
  accessToken: string,
  skuId: string,
  input: UpdateCartItemQuantityInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/cart/items/${skuId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function removeCartItem(
  accessToken: string,
  skuId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/cart/items/${skuId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
