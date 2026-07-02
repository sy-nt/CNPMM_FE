import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import type {
  DiscountClaim,
  DiscountClaimListResponse,
  DiscountListResponse,
  DiscountRule,
  DiscountScope,
  DiscountType,
  DiscountValueType,
} from '#/lib/schemas/discount.schema'
import {
  discountClaimListResponseSchema,
  discountClaimSchema,
  discountListResponseSchema,
} from '#/lib/schemas/discount.schema'
import type { Maybe } from '#/lib/types'

export type DiscountListQuery = PaginationQuery<
  'createdAt' | 'name' | 'usedCount' | 'validUntil'
>

export type PlatformDiscountListQuery = DiscountListQuery & {
  discountType?: DiscountType
}

export type DiscountClaimListQuery = PaginationQuery<'createdAt'>

export type { DiscountValueType, DiscountType, DiscountScope, DiscountRule }

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

export type AdminDiscountListQuery = DiscountListQuery & {
  scope?: DiscountScope
  isActive?: boolean
  code?: string
  discountType?: DiscountType
}

export function createShopDiscount(
  accessToken: string,
  input: CreateShopDiscountInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/shop/discount/', {
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
  return apiRequest(`/shop/discount/${discountId}`, {
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
  return apiRequest(`/shop/discount/${discountId}`, {
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
  return apiRequest(`/shop/discount/${discountId}`, {
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
  return apiRequest('/shop/discounts/', {
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
  return apiRequest('/admin/discount/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function getAdminDiscount(
  accessToken: string,
  discountId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/admin/discount/${discountId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function updateAdminDiscount(
  accessToken: string,
  discountId: string,
  input: UpdateDiscountInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/admin/discount/${discountId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteAdminDiscount(
  accessToken: string,
  discountId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/admin/discount/${discountId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function listAdminDiscounts(
  accessToken: string,
  query: AdminDiscountListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/admin/discounts/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}

export async function listPlatformDiscounts(
  accessToken: Maybe<string>,
  query: PlatformDiscountListQuery = {},
  signal?: AbortSignal,
): Promise<DiscountListResponse> {
  const raw = await apiRequest<unknown>('/discounts/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return discountListResponseSchema.parse(raw)
}

export async function claimDiscount(
  accessToken: string,
  discountId: string,
  signal?: AbortSignal,
): Promise<DiscountClaim> {
  const raw = await apiRequest<unknown>(`/discount/${discountId}/claim`, {
    method: 'POST',
    accessToken,
    signal,
  })
  return discountClaimSchema.parse(raw)
}

export async function listMyDiscountClaims(
  accessToken: string,
  query: DiscountClaimListQuery = {},
  signal?: AbortSignal,
): Promise<DiscountClaimListResponse> {
  const raw = await apiRequest<unknown>('/discounts/me/claims', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return discountClaimListResponseSchema.parse(raw)
}
