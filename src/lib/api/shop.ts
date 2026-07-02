import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import type { CreateAddressInput } from '#/lib/api/address'
import { SHOP_DETAILS_ME } from '#/lib/api/shop.constants'
import {
  registerShopResponseSchema,
  shopDetailsEnvelopeSchema,
  shopListResponseSchema,
  shopPublicProfileSchema,
} from '#/lib/schemas/shop.schema'
import type {
  AssignShopWorkerInput,
  ShopWorkerList,
  UnassignShopWorkerInput,
} from '#/lib/schemas/shop-worker.schema'
import { shopWorkerListSchema } from '#/lib/schemas/shop-worker.schema'
import type {
  RegisterShopResponse,
  ShopListResponse,
  ShopPublicProfile,
} from '#/lib/schemas/shop.schema'
import type { Maybe } from '#/lib/types'

export type ShopListQuery = PaginationQuery<
  'createdAt' | 'updatedAt' | 'name' | 'status'
>

export type AdminShopListQuery = ShopListQuery & {
  status?: string
}

export type RegisterShopInput = {
  name: string
  description?: string
  imageKey?: string
  addresses: ReadonlyArray<CreateAddressInput>
}

export type { AssignShopWorkerInput, UnassignShopWorkerInput } from '#/lib/schemas/shop-worker.schema'

export type UpdateShopInput = {
  name?: string
  description?: string
  imageKey?: string
}

export type UpdateShopStatusInput = {
  id: string
  status: string
}

export async function listShops(
  accessToken: Maybe<string>,
  query: ShopListQuery = {},
  signal?: AbortSignal,
): Promise<ShopListResponse> {
  const raw = await apiRequest<unknown>('/shops/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return shopListResponseSchema.parse(raw)
}

export async function listAdminShops(
  accessToken: string,
  query: AdminShopListQuery = {},
  signal?: AbortSignal,
): Promise<ShopListResponse> {
  const raw = await apiRequest<unknown>('/admin/shops/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return shopListResponseSchema.parse(raw)
}

export async function registerShop(
  accessToken: string,
  input: RegisterShopInput,
  signal?: AbortSignal,
): Promise<RegisterShopResponse> {
  const raw = await apiRequest<unknown>('/shop/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
  return registerShopResponseSchema.parse(raw)
}

export async function listShopWorkers(
  accessToken: string,
  signal?: AbortSignal,
): Promise<ShopWorkerList> {
  const raw = await apiRequest<unknown>('/shop/workers', {
    method: 'GET',
    accessToken,
    signal,
  })
  return shopWorkerListSchema.parse(raw)
}

export function assignShopWorker(
  accessToken: string,
  input: AssignShopWorkerInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/shop/workers', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function unassignShopWorker(
  accessToken: string,
  input: UnassignShopWorkerInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/shop/workers', {
    method: 'DELETE',
    accessToken,
    body: input,
    signal,
  })
}

export function updateShop(
  accessToken: string,
  input: UpdateShopInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/shop/', {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
}

export function updateShopStatus(
  accessToken: string,
  input: UpdateShopStatusInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/admin/shop/status', {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export async function getShop(
  accessToken: Maybe<string>,
  idOrSlug: string,
  signal?: AbortSignal,
): Promise<ShopPublicProfile> {
  const raw = await apiRequest<unknown>(
    `/shop/${encodeURIComponent(idOrSlug)}`,
    {
      method: 'GET',
      accessToken,
      signal,
    },
  )
  return shopPublicProfileSchema.parse(raw)
}

export function getShopDetails(
  accessToken: Maybe<string>,
  idOrSlug: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/shop/details/${idOrSlug}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export async function getMyShopDetails(
  accessToken: string,
  signal?: AbortSignal,
): Promise<ShopPublicProfile> {
  const raw = await apiRequest<unknown>(`/shop/details/${SHOP_DETAILS_ME}`, {
    method: 'GET',
    accessToken,
    signal,
  })
  const envelope = shopDetailsEnvelopeSchema.safeParse(raw)
  if (envelope.success) return envelope.data.shop
  return shopPublicProfileSchema.parse(raw)
}
