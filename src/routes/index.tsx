import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { CategoryShell } from '#/components/layout/category-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { getPostAuthRedirect, POST_AUTH_DEFAULT_ROUTE } from '#/lib/auth-redirect'
import { ApiError } from '#/lib/api/client'
import {
  collectClaimedDiscountIds,
  MY_DISCOUNT_CLAIMS_DEFAULT_QUERY,
  PLATFORM_DISCOUNT_HOME_QUERY,
} from '#/lib/api/discount.constants'
import { getRandomProductSample } from '#/lib/api/product'
import {
  PRODUCT_LIST_DEFAULT_QUERY,
  PRODUCT_SLIDER_DISPLAY_COUNT,
  PRODUCT_SLIDER_POOL_SIZE,
  PRODUCT_SLIDER_QUERY,
} from '#/lib/api/product.constants'
import {
  categoryBySlugQueryOptions,
} from '#/lib/query/category'
import {
  myDiscountClaimsQueryOptions,
  platformDiscountListQueryOptions,
} from '#/lib/query/discount'
import { productListQueryOptions } from '#/lib/query/product'
import type { Category } from '#/lib/schemas/category.schema'
import type { PlatformDiscount } from '#/lib/schemas/discount.schema'
import type { ProductSummary } from '#/lib/schemas/product.schema'
import { HomePage } from '#/pages/home/home-page'
import { authStore } from '#/stores/auth.store'

const homeSearchSchema = z.object({
  search: z.string().trim().min(1).optional().catch(undefined),
  category: z.string().trim().min(1).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export type HomeLoaderResult = {
  products: ReadonlyArray<ProductSummary>
  slider: ReadonlyArray<ProductSummary>
  platformDiscounts: ReadonlyArray<PlatformDiscount>
  claimedDiscountIds: ReadonlySet<string>
  search: string | undefined
  activeCategory: Category | null
  page: number
  totalPage: number
  error: string | undefined
}

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const destination = getPostAuthRedirect(authStore.state.role?.name)
    if (destination !== POST_AUTH_DEFAULT_ROUTE) {
      throw redirect({ to: destination })
    }
  },
  component: HomePage,
  validateSearch: homeSearchSchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
    category: search.category,
    page: search.page ?? 1,
  }),
  pendingComponent: () => (
    <CategoryShell>
      <LoadingFallback variant="inline" label="Loading products…" />
    </CategoryShell>
  ),
  loader: async ({
    deps,
    abortController,
    context,
  }): Promise<HomeLoaderResult> => {
    const { queryClient } = context
    const accessToken = authStore.state.accessToken
    const signal = abortController.signal
    const isSearching = Boolean(deps.search)
    const isFiltered = Boolean(deps.category)

    let activeCategory: Category | null = null
    if (deps.category) {
      activeCategory = await queryClient.fetchQuery(
        categoryBySlugQueryOptions(accessToken, deps.category),
      )
    }

    const feedQuery = productListQueryOptions(accessToken, {
      ...PRODUCT_LIST_DEFAULT_QUERY,
      page: deps.page,
      search: deps.search,
      categoryId: activeCategory?.id,
      orderBy: 'soldCount',
    })

    const showPromotions = !isSearching && !isFiltered

    const [feedResult, sliderResult, discountsResult, claimsResult] =
      await Promise.allSettled([
        queryClient.fetchQuery(feedQuery),
        isSearching || isFiltered
          ? Promise.resolve<ReadonlyArray<ProductSummary>>([])
          : getRandomProductSample(
              accessToken,
              {
                poolSize: PRODUCT_SLIDER_POOL_SIZE,
                displayCount: PRODUCT_SLIDER_DISPLAY_COUNT,
                query: PRODUCT_SLIDER_QUERY,
              },
              signal,
            ),
        showPromotions
          ? queryClient.fetchQuery(
              platformDiscountListQueryOptions(
                accessToken,
                PLATFORM_DISCOUNT_HOME_QUERY,
              ),
            )
          : Promise.resolve({ items: [] }),
        showPromotions && accessToken
          ? queryClient.fetchQuery(
              myDiscountClaimsQueryOptions(accessToken, {
                ...MY_DISCOUNT_CLAIMS_DEFAULT_QUERY,
                limit: 100,
              }),
            )
          : Promise.resolve({ items: [] }),
      ])
    const slider = sliderResult.status === 'fulfilled' ? sliderResult.value : []
    const platformDiscounts =
      discountsResult.status === 'fulfilled'
        ? discountsResult.value.items
        : []
    const claimedDiscountIds =
      claimsResult.status === 'fulfilled'
        ? collectClaimedDiscountIds(claimsResult.value.items)
        : new Set<string>()

    if (feedResult.status === 'rejected') {
      const reason = feedResult.reason
      if (reason instanceof ApiError) {
        return {
          products: [],
          slider,
          platformDiscounts,
          claimedDiscountIds,
          search: deps.search,
          activeCategory,
          page: deps.page,
          totalPage: 0,
          error: _humanizeProductError(reason),
        }
      }
      throw reason
    }

    return {
      products: feedResult.value.items,
      slider,
      platformDiscounts,
      claimedDiscountIds,
      search: deps.search,
      activeCategory,
      page: feedResult.value.currentPage || deps.page,
      totalPage: feedResult.value.totalPage,
      error: undefined,
    }
  },
})

function _humanizeProductError(error: ApiError): string {
  if (error.status === 401 || error.status === 403) {
    return 'Sign in to browse products.'
  }
  return error.message || 'Could not load products.'
}
