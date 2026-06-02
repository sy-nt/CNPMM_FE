import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'

export type DiscountListQuery = PaginationQuery<
  'createdAt' | 'updatedAt' | 'validFrom' | 'validUntil'
>

export type DiscountValueType = 'percentage' | 'fixed'
export type DiscountType = 'product' | 'delivery'
export type DiscountScope = 'shop' | 'global'

export type DiscountRule = {
  type: string
  params: Record<string, unknown>
}

export type CreateShopDiscountInput = {
  name: string
  code: string
  description?: string
  value: string
  valueType: DiscountValueType
  maxDiscountAmount?: string
  maxUses?: number
  maxUsesPerUser?: number
  isActive?: boolean
  validFrom?: string
  validUntil?: string
  rules?: ReadonlyArray<DiscountRule>
  targetSpuIds?: ReadonlyArray<string>
}

export type UpdateShopDiscountInput = Partial<CreateShopDiscountInput>

export type CreateGlobalDiscountInput = {
  name: string
  code: string
  description?: string
  value: string
  valueType: DiscountValueType
  discountType: DiscountType
  scope: DiscountScope
  maxUses?: number
  isActive?: boolean
  rules?: ReadonlyArray<DiscountRule>
}

export type UpdateDiscountInput = Partial<CreateGlobalDiscountInput>

export function createShopDiscount(
  accessToken: string,
  input: CreateShopDiscountInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/discount/shop', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function getShopDiscount(
  accessToken: string,
  discountId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/discount/shop/${discountId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function updateShopDiscount(
  accessToken: string,
  discountId: string,
  input: UpdateShopDiscountInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/discount/shop/${discountId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteShopDiscount(
  accessToken: string,
  discountId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/discount/shop/${discountId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function listShopDiscounts(
  accessToken: string,
  query: DiscountListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/discounts/shop', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}

export function createGlobalDiscount(
  accessToken: string,
  input: CreateGlobalDiscountInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/discount/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function getDiscount(
  accessToken: string,
  discountId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/discount/${discountId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function updateDiscount(
  accessToken: string,
  discountId: string,
  input: UpdateDiscountInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/discount/${discountId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteDiscount(
  accessToken: string,
  discountId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/discount/${discountId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function listDiscounts(
  accessToken: string,
  query: DiscountListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/discounts/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}
