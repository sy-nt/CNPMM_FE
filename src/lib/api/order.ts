import { apiRequest } from '#/lib/api/client'
import { buildIdempotencyHeaders } from '#/lib/api/common'
import type { IdempotencyKey, PaginationQuery } from '#/lib/api/common'

export type OrderListQuery = PaginationQuery<
  'createdAt' | 'updatedAt' | 'status'
>

export type CheckoutPreviewInput = {
  destinationAddressId: string
  deliveryMethodId: string
  code?: string
}

export type CheckoutInput = {
  destinationAddressId: string
  deliveryMethodId: string
  expectedTotalAmount: string
  code?: string
}

export type UpdateOrderStatusInput = {
  status: string
}

export type CancelOrderInput = {
  reason: string
}

export function previewCheckout(
  accessToken: string,
  input: CheckoutPreviewInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/order/checkout/preview', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function placeOrder(
  accessToken: string,
  input: CheckoutInput,
  idempotencyKey: IdempotencyKey,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/order/checkout', {
    method: 'POST',
    accessToken,
    body: input,
    headers: buildIdempotencyHeaders(idempotencyKey),
    signal,
  })
}

export function getOrder(
  accessToken: string,
  orderId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/order/${orderId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function updateOrderStatus(
  accessToken: string,
  orderId: string,
  input: UpdateOrderStatusInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/order/${orderId}/status`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function cancelOrder(
  accessToken: string,
  orderId: string,
  input: CancelOrderInput,
  options: { idempotencyKey?: IdempotencyKey; signal?: AbortSignal } = {},
): Promise<unknown> {
  return apiRequest(`/order/${orderId}/cancel`, {
    method: 'POST',
    accessToken,
    body: input,
    headers: buildIdempotencyHeaders(options.idempotencyKey),
    signal: options.signal,
  })
}

export function listOrders(
  accessToken: string,
  query: OrderListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/orders/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}
