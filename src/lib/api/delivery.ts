import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'

export type DeliveryListQuery = PaginationQuery<'createdAt' | 'updatedAt'>
export type DeliveryRateListQuery = PaginationQuery<'createdAt' | 'updatedAt'>

export type QuoteDeliveryItem = {
  skuId: string
  quantity: number
}

export type QuoteDeliveryInput = {
  addressId: string
  warehouseId: string
  items: ReadonlyArray<QuoteDeliveryItem>
  deliveryMethodId?: string
}

export type UpdateDeliveryStatusInput = {
  status: string
  trackingCode?: string
  notes?: string
}

export type CreateDeliveryMethodInput = {
  code: string
  name: string
  description?: string
  etaMinDays: number
  etaMaxDays: number
  isActive?: boolean
  providerCode?: string
}

export type UpdateDeliveryMethodInput = Partial<CreateDeliveryMethodInput>

export type CreateDeliveryZoneInput = {
  code: string
  name: string
  description?: string
  displayOrder?: number
  isActive?: boolean
}

export type UpdateDeliveryZoneInput = Partial<CreateDeliveryZoneInput>

export type CreateDeliveryRateInput = {
  deliveryMethodId: string
  deliveryZoneId: string
  baseFee: string
}

export type UpdateDeliveryRateInput = Partial<CreateDeliveryRateInput>

export function quoteDelivery(
  accessToken: string,
  input: QuoteDeliveryInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/delivery/quote', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function getDelivery(
  accessToken: string,
  deliveryId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/${deliveryId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function updateDeliveryStatus(
  accessToken: string,
  deliveryId: string,
  input: UpdateDeliveryStatusInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/${deliveryId}/status`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function listDeliveries(
  accessToken: string,
  query: DeliveryListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/deliveries/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}

export function createDeliveryMethod(
  accessToken: string,
  input: CreateDeliveryMethodInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/delivery/method', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function getDeliveryMethod(
  accessToken: string,
  deliveryMethodId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/method/${deliveryMethodId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function listDeliveryMethods(
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/deliveries/methods', {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function updateDeliveryMethod(
  accessToken: string,
  deliveryMethodId: string,
  input: UpdateDeliveryMethodInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/method/${deliveryMethodId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteDeliveryMethod(
  accessToken: string,
  deliveryMethodId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/method/${deliveryMethodId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function createDeliveryZone(
  accessToken: string,
  input: CreateDeliveryZoneInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/delivery/zone', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function listDeliveryZones(
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/deliveries/zones', {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function updateDeliveryZone(
  accessToken: string,
  deliveryZoneId: string,
  input: UpdateDeliveryZoneInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/zone/${deliveryZoneId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteDeliveryZone(
  accessToken: string,
  deliveryZoneId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/zone/${deliveryZoneId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function createDeliveryRate(
  accessToken: string,
  input: CreateDeliveryRateInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/delivery/rate', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function listDeliveryRates(
  accessToken: string,
  query: DeliveryRateListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/deliveries/rates', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}

export function updateDeliveryRate(
  accessToken: string,
  deliveryRateId: string,
  input: UpdateDeliveryRateInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/rate/${deliveryRateId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteDeliveryRate(
  accessToken: string,
  deliveryRateId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/delivery/rate/${deliveryRateId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
