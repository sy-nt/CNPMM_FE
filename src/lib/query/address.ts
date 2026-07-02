import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  createPersonalAddress,
  createShopAddress,
  deletePersonalAddress,
  deleteShopAddress,
  invalidatePersonalAddresses,
  listShopAddresses,
  updatePersonalAddress,
  updateShopAddress,
} from '#/lib/api/address'
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from '#/lib/api/address'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { addressKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export type UpdatePersonalAddressMutationInput = {
  addressId: string
  input: UpdateAddressInput
}

export type UpdateShopAddressMutationInput = {
  shopAddressId: string
  input: UpdateAddressInput
}

export function personalAddressMutations(accessToken: string) {
  const afterAddressChange = (): void => {
    invalidatePersonalAddresses()
  }

  return {
    create: createMutationOptions({
      mutationKey: addressKeys.mutation('create-personal', accessToken),
      mutationFn: (input: CreateAddressInput) =>
        createPersonalAddress(accessToken, input),
      afterSuccess: () => {
        afterAddressChange()
      },
    }),
    update: createMutationOptions({
      mutationKey: addressKeys.mutation('update-personal', accessToken),
      mutationFn: ({ addressId, input }: UpdatePersonalAddressMutationInput) =>
        updatePersonalAddress(accessToken, addressId, input),
      afterSuccess: () => {
        afterAddressChange()
      },
    }),
    delete: createMutationOptions({
      mutationKey: addressKeys.mutation('delete-personal', accessToken),
      mutationFn: (addressId: string) =>
        deletePersonalAddress(accessToken, addressId),
      afterSuccess: () => {
        afterAddressChange()
      },
    }),
  } as const
}

export function shopAddressListQueryOptions(accessToken: string) {
  return queryOptions({
    queryKey: addressKeys.shop(accessToken),
    queryFn: ({ signal }) => listShopAddresses(accessToken, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function shopAddressMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterShopAddressChange = async (): Promise<void> => {
    await invalidateShopAddressQueries(queryClient, accessToken)
  }

  return {
    create: createMutationOptions({
      mutationKey: addressKeys.mutation('create-shop', accessToken),
      mutationFn: (input: CreateAddressInput) =>
        createShopAddress(accessToken, input),
      afterSuccess: () => {
        void afterShopAddressChange()
      },
    }),
    update: createMutationOptions({
      mutationKey: addressKeys.mutation('update-shop', accessToken),
      mutationFn: ({ shopAddressId, input }: UpdateShopAddressMutationInput) =>
        updateShopAddress(accessToken, shopAddressId, input),
      afterSuccess: () => {
        void afterShopAddressChange()
      },
    }),
    delete: createMutationOptions({
      mutationKey: addressKeys.mutation('delete-shop', accessToken),
      mutationFn: (shopAddressId: string) =>
        deleteShopAddress(accessToken, shopAddressId),
      afterSuccess: () => {
        void afterShopAddressChange()
      },
    }),
  } as const
}

export function invalidateShopAddressQueries(
  queryClient: QueryClient,
  accessToken: string,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: addressKeys.shop(accessToken),
  })
}
