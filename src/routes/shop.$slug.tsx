import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'

import { AppShell } from '#/components/layout/app-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { ApiError } from '#/lib/api/client'
import { PRODUCT_LIST_DEFAULT_QUERY } from '#/lib/api/product.constants'
import { SHOP_PRODUCT_PAGE_SIZE } from '#/lib/api/shop.constants'
import { productListQueryOptions } from '#/lib/query/product'
import { shopDetailQueryOptions } from '#/lib/query/shop'
import type { ProductSummary } from '#/lib/schemas/product.schema'
import type { ShopPublicProfile } from '#/lib/schemas/shop.schema'
import { ShopPage } from '#/pages/shop/shop-page'
import { authStore } from '#/stores/auth.store'

const shopSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export type ShopLoaderResult = {
  shop: ShopPublicProfile
  products: ReadonlyArray<ProductSummary>
  page: number
  totalPage: number
  error: string | undefined
}

export const Route = createFileRoute('/shop/$slug')({
  component: ShopPage,
  validateSearch: shopSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
  }),
  pendingComponent: () => (
    <AppShell>
      <LoadingFallback variant="inline" label="Loading shop…" />
    </AppShell>
  ),
  loader: async ({ params, deps, context }): Promise<ShopLoaderResult> => {
    const { queryClient } = context
    const accessToken = authStore.state.accessToken

    let shop: ShopPublicProfile
    try {
      shop = await queryClient.fetchQuery(
        shopDetailQueryOptions(accessToken, params.slug),
      )
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw notFound()
      }
      throw error
    }

    if (!shop.id) {
      throw notFound()
    }

    try {
      const feed = await queryClient.fetchQuery(
        productListQueryOptions(accessToken, {
          ...PRODUCT_LIST_DEFAULT_QUERY,
          page: deps.page,
          limit: SHOP_PRODUCT_PAGE_SIZE,
          shopId: shop.id,
          isActive: true,
        }),
      )

      return {
        shop,
        products: feed.items,
        page: feed.currentPage || deps.page,
        totalPage: feed.totalPage,
        error: undefined,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          shop,
          products: [],
          page: deps.page,
          totalPage: 0,
          error: _humanizeProductError(error),
        }
      }
      throw error
    }
  },
})

function _humanizeProductError(error: ApiError): string {
  if (error.status === 401 || error.status === 403) {
    return 'Sign in to browse products from this shop.'
  }
  return error.message || 'Could not load products for this shop.'
}
