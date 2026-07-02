import { apiRequest } from '#/lib/api/client'
import { buildIdempotencyHeaders } from '#/lib/api/common'
import type { IdempotencyKey, PaginationQuery } from '#/lib/api/common'
import {
  checkoutPreviewResponseSchema,
  orderListResponseSchema,
  placeOrderResponseSchema,
} from '#/lib/schemas/order.schema'
import type {
  CheckoutPreviewInput,
  CheckoutPreviewResponse,
  OrderListResponse,
  PlaceOrderInput,
  PlaceOrderResponse,
} from '#/lib/schemas/order.schema'

export type OrderListQuery = PaginationQuery<
  'createdAt' | 'updatedAt' | 'status'
> & {
  status?: string
  shopId?: string
}

export type UpdateOrderStatusInput = {
  status: string
}

export type CancelOrderInput = {
  reason: string
}

export async function previewCheckout(
  accessToken: string,
  input: CheckoutPreviewInput,
  signal?: AbortSignal,
): Promise<CheckoutPreviewResponse> {
  const raw = await apiRequest<unknown>('/order/checkout/preview', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
  return checkoutPreviewResponseSchema.parse(raw)
}

export async function placeOrder(
  accessToken: string,
  input: PlaceOrderInput,
  idempotencyKey: IdempotencyKey,
  signal?: AbortSignal,
): Promise<PlaceOrderResponse> {
  const raw = await apiRequest<unknown>('/order/checkout', {
    method: 'POST',
    accessToken,
    body: input,
    headers: buildIdempotencyHeaders(idempotencyKey),
    signal,
  })
  return placeOrderResponseSchema.parse(raw)
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

export async function listOrders(
  accessToken: string,
  query: OrderListQuery = {},
  signal?: AbortSignal,
): Promise<OrderListResponse> {
  const raw = await apiRequest<unknown>('/orders/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return orderListResponseSchema.parse(raw)
}
