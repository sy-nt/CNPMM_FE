import { invalidateCacheByPrefix, withCache } from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import { personalAddressListSchema, shopAddressListSchema } from '#/lib/schemas/address.schema'
import type { PersonalAddressList, ShopAddressList } from '#/lib/schemas/address.schema'

const PERSONAL_ADDRESS_CACHE_PREFIX = 'address:personal:'

export type CreateAddressInput = {
  name: string
  addressLine: string
  city: string
  district: string
  state: string
  country: string
  latitude?: string
  longitude?: string
  isPrimary?: boolean
}

export type UpdateAddressInput = Partial<CreateAddressInput>

export function listPersonalAddresses(
  accessToken: string,
  signal?: AbortSignal,
): Promise<PersonalAddressList> {
  return withCache(
    { key: `${PERSONAL_ADDRESS_CACHE_PREFIX}${accessToken}` },
    async (innerSignal) => {
      const data = await apiRequest<unknown>('/addresses/', {
        method: 'GET',
        accessToken,
        signal: innerSignal,
      })
      return personalAddressListSchema.parse(data)
    },
    signal,
  )
}

export function invalidatePersonalAddresses(): void {
  invalidateCacheByPrefix(PERSONAL_ADDRESS_CACHE_PREFIX)
}

export function listShopAddresses(
  accessToken: string,
  signal?: AbortSignal,
): Promise<ShopAddressList> {
  return apiRequest<unknown>('/shop/addresses/', {
    method: 'GET',
    accessToken,
    signal,
  }).then((data) => shopAddressListSchema.parse(data))
}

export function createPersonalAddress(
  accessToken: string,
  input: CreateAddressInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/address/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function createShopAddress(
  accessToken: string,
  input: CreateAddressInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/shop/address/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function updatePersonalAddress(
  accessToken: string,
  addressId: string,
  input: UpdateAddressInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/address/${addressId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function updateShopAddress(
  accessToken: string,
  shopAddressId: string,
  input: UpdateAddressInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/shop/address/${shopAddressId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deletePersonalAddress(
  accessToken: string,
  addressId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/address/${addressId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function deleteShopAddress(
  accessToken: string,
  shopAddressId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/shop/address/${shopAddressId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
