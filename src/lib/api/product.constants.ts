import type { ProductListQuery } from '#/lib/api/product'

export const PRODUCT_PAGE_SIZE = 24

export const PRODUCT_SLIDER_DISPLAY_COUNT = 10

export const PRODUCT_SLIDER_POOL_SIZE = 50

export const SIMILAR_PRODUCTS_LIMIT = 4

export const PRODUCT_LIST_DEFAULT_QUERY = {
  page: 1,
  limit: PRODUCT_PAGE_SIZE,
  sort: 'desc',
  orderBy: 'createdAt',
} as const satisfies ProductListQuery

export const PRODUCT_SLIDER_QUERY = {
  sort: 'desc',
  orderBy: 'createdAt',
} as const satisfies Omit<ProductListQuery, 'page' | 'limit'>
