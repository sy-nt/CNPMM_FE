import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { LoadingFallback } from '#/components/loading-fallback'
import { MY_DISCOUNT_CLAIMS_DEFAULT_QUERY } from '#/lib/api/discount.constants'
import { ApiError } from '#/lib/api/client'
import { myDiscountClaimsQueryOptions } from '#/lib/query/discount'
import type { DiscountClaimListResponse } from '#/lib/schemas/discount.schema'
import { DiscountsPage } from '#/pages/me/discounts-page'
import { authStore } from '#/stores/auth.store'

const discountsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export type MeDiscountsLoaderResult = {
  claims: DiscountClaimListResponse
  page: number
  totalPage: number
}

export const Route = createFileRoute('/me/discounts')({
  validateSearch: (search) => discountsSearchSchema.parse(search),
  component: DiscountsPage,
  pendingComponent: () => (
    <LoadingFallback variant="inline" label="Loading discounts…" />
  ),
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps }): Promise<MeDiscountsLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    try {
      const claims = await context.queryClient.ensureQueryData(
        myDiscountClaimsQueryOptions(accessToken, {
          ...MY_DISCOUNT_CLAIMS_DEFAULT_QUERY,
          page: deps.page,
        }),
      )
      return {
        claims,
        page: claims.currentPage,
        totalPage: claims.totalPage,
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        throw redirect({ to: '/sign-in' })
      }
      throw error
    }
  },
})
