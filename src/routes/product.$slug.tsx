import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { CategoryShell } from '#/components/layout/category-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { ApiError } from '#/lib/api/client'
import { SIMILAR_PRODUCTS_LIMIT } from '#/lib/api/product.constants'
import {
  productDetailQueryOptions,
  productListQueryOptions,
} from '#/lib/query/product'
import type {
  ProductDetail,
  ProductSummary,
} from '#/lib/schemas/product.schema'
import type { Maybe } from '#/lib/types'
import { ProductDetailPage } from '#/pages/product/product-detail-page'
import { authStore } from '#/stores/auth.store'

export type ProductDetailLoaderResult = {
  product: ProductDetail
  similar: ReadonlyArray<ProductSummary>
}

export const Route = createFileRoute('/product/$slug')({
  component: ProductDetailPage,
  pendingComponent: () => (
    <CategoryShell>
      <LoadingFallback variant="inline" label="Loading product…" />
    </CategoryShell>
  ),
  loader: async ({
    params,
    context,
  }): Promise<ProductDetailLoaderResult> => {
    const { queryClient } = context
    const accessToken = authStore.state.accessToken

    let product: ProductDetail
    try {
      product = await queryClient.ensureQueryData(
        productDetailQueryOptions(accessToken, params.slug),
      )
    } catch (error) {
      _handleProductFetchError(error)
      throw error
    }

    const similar = await _fetchSimilarProducts(
      queryClient,
      accessToken,
      product,
    )

    return { product, similar }
  },
})

function _handleProductFetchError(error: unknown): void {
  if (!(error instanceof ApiError)) return
  if (error.status === 404) {
    throw notFound()
  }
  if (error.status === 401 || error.status === 403) {
    throw redirect({ to: '/sign-in' })
  }
}

async function _fetchSimilarProducts(
  queryClient: QueryClient,
  accessToken: Maybe<string>,
  product: ProductDetail,
): Promise<ReadonlyArray<ProductSummary>> {
  try {
    const response = await queryClient.fetchQuery(
      productListQueryOptions(accessToken, {
        page: 1,
        limit: SIMILAR_PRODUCTS_LIMIT + 1,
        sort: 'desc',
        orderBy: 'createdAt',
        categoryId: product.categoryId,
        isActive: true,
      }),
    )
    return response.items
      .filter((item) => item.id !== product.id)
      .slice(0, SIMILAR_PRODUCTS_LIMIT)
  } catch {
    return []
  }
}
