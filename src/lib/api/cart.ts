import { apiRequest } from '#/lib/api/client'
import { buildIdempotencyHeaders } from '#/lib/api/common'
import type { IdempotencyKey } from '#/lib/api/common'
import { cartSchema } from '#/lib/schemas/cart.schema'
import type { Cart } from '#/lib/schemas/cart.schema'

export type AddCartItemInput = {
  skuId: string
  quantity: number
}

export type UpdateCartItemQuantityInput = {
  quantity: number
}

export async function getCart(
  accessToken: string,
  signal?: AbortSignal,
): Promise<Cart> {
  const data = await apiRequest<unknown>('/cart/', {
    method: 'GET',
    accessToken,
    signal,
  })
  return cartSchema.parse(data)
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
