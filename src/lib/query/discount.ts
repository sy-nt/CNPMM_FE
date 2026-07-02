import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type {
  DiscountClaimListQuery,
  PlatformDiscountListQuery,
} from '#/lib/api/discount'
import {
  claimDiscount,
  listMyDiscountClaims,
  listPlatformDiscounts,
} from '#/lib/api/discount'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { discountKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'
import type { Maybe } from '#/lib/types'

export function platformDiscountListQueryOptions(
  accessToken: Maybe<string>,
  query: PlatformDiscountListQuery,
) {
  return queryOptions({
    queryKey: discountKeys.platformList(accessToken ?? null, query),
    queryFn: ({ signal }) => listPlatformDiscounts(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function myDiscountClaimsQueryOptions(
  accessToken: string,
  query: DiscountClaimListQuery,
) {
  return queryOptions({
    queryKey: discountKeys.claimList(accessToken, query),
    queryFn: ({ signal }) => listMyDiscountClaims(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function invalidateDiscountQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: discountKeys.all })
}

export type ClaimDiscountMutationInput = {
  discountId: string
}

export function discountMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  return {
    claim: createMutationOptions({
      mutationKey: discountKeys.mutation('claim', accessToken),
      mutationFn: (input: ClaimDiscountMutationInput) =>
        claimDiscount(accessToken, input.discountId),
      afterSuccess: () => invalidateDiscountQueries(queryClient),
    }),
  } as const
}
