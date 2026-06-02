import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { CategoryShell } from '#/components/layout/category-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { ApiError } from '#/lib/api/client'
import { getProduct, listProducts } from '#/lib/api/product'
import { SIMILAR_PRODUCTS_LIMIT } from '#/lib/api/product.constants'
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
    abortController,
  }): Promise<ProductDetailLoaderResult> => {
    const accessToken = authStore.state.accessToken
    const signal = abortController.signal

    let product: ProductDetail
    try {
      product = await getProduct(accessToken, params.slug, signal)
    } catch (error) {
      _handleProductFetchError(error)
      throw error
    }

    const similar = await _fetchSimilarProducts(accessToken, product, signal)

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

/**
 * Best-effort sibling lookup for the "More from this category" rail. Failures
 * here MUST NOT bubble — the detail page is still useful without related
 * products. We over-fetch by one so we can drop the current product without
 * leaving a hole in the grid.
 */
async function _fetchSimilarProducts(
  accessToken: Maybe<string>,
  product: ProductDetail,
  signal: AbortSignal,
): Promise<ReadonlyArray<ProductSummary>> {
  try {
    const response = await listProducts(
      accessToken,
      {
        page: 1,
        limit: SIMILAR_PRODUCTS_LIMIT + 1,
        sort: 'desc',
        orderBy: 'createdAt',
        categoryId: product.categoryId,
        isActive: true,
      },
      signal,
    )
    return response.items
      .filter((item) => item.id !== product.id)
      .slice(0, SIMILAR_PRODUCTS_LIMIT)
  } catch {
    return []
  }
}
