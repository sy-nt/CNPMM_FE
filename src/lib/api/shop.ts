import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import type { CreateAddressInput } from '#/lib/api/address'
import type { Maybe } from '#/lib/types'

export type ShopListQuery = PaginationQuery<
  'createdAt' | 'updatedAt' | 'name' | 'status'
>

export type RegisterShopInput = {
  name: string
  description?: string
  addresses: ReadonlyArray<CreateAddressInput>
}

export type AssignShopWorkerInput = {
  email: string
}

export type UpdateShopInput = {
  name?: string
  description?: string
}

export type UpdateShopStatusInput = {
  id: string
  status: string
}

export function listShops(
  accessToken: Maybe<string>,
  query: ShopListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/shops/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}

export function registerShop(
  accessToken: string,
  input: RegisterShopInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/shop/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
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
  return apiRequest('/shop/status', {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function getShop(
  accessToken: Maybe<string>,
  idOrSlug: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/shop/${idOrSlug}`, {
    method: 'GET',
    accessToken,
    signal,
  })
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
