import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { CategoryShell } from '#/components/layout/category-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import {
  getCachedCategories,
  listCategories,
} from '#/lib/api/category'
import { CATEGORY_LIST_DEFAULT_QUERY } from '#/lib/api/category.constants'
import { ApiError } from '#/lib/api/client'
import { getRandomProductSample, listProducts } from '#/lib/api/product'
import {
  PRODUCT_LIST_DEFAULT_QUERY,
  PRODUCT_SLIDER_DISPLAY_COUNT,
  PRODUCT_SLIDER_POOL_SIZE,
  PRODUCT_SLIDER_QUERY,
} from '#/lib/api/product.constants'
import type { Category } from '#/lib/schemas/category.schema'
import type { ProductSummary } from '#/lib/schemas/product.schema'
import { findBySlug } from '#/lib/slug'
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
  search: string | undefined
  activeCategory: Category | null
  page: number
  totalPage: number
  error: string | undefined
}

export const Route = createFileRoute('/')({
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
  loader: async ({ deps, abortController }): Promise<HomeLoaderResult> => {
    const accessToken = authStore.state.accessToken
    const signal = abortController.signal
    const isSearching = Boolean(deps.search)
    const isFiltered = Boolean(deps.category)

    let activeCategory: Category | null = null
    if (deps.category) {
      const list = await listCategories(
        accessToken,
        CATEGORY_LIST_DEFAULT_QUERY,
        signal,
      )
      const bySlug = (c: Category) => c.slug
      activeCategory =
        findBySlug(getCachedCategories(), bySlug, deps.category) ??
        findBySlug(list, bySlug, deps.category) ??
        null
    }

    const [feedResult, sliderResult] = await Promise.allSettled([
      listProducts(
        accessToken,
        {
          ...PRODUCT_LIST_DEFAULT_QUERY,
          page: deps.page,
          search: deps.search,
          categoryId: activeCategory?.id,
        },
        signal,
      ),
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
    ])
    const slider = sliderResult.status === 'fulfilled' ? sliderResult.value : []

    if (feedResult.status === 'rejected') {
      const reason = feedResult.reason
      if (reason instanceof ApiError) {
        return {
          products: [],
          slider,
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
