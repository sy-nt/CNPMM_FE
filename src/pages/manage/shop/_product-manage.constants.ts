import type { ShopProductListQuery } from '#/lib/api/product'

export const PRODUCT_MANAGE_TABS = {
  OVERVIEW: 'overview',
  ATTRIBUTES: 'attributes',
  SKUS: 'skus',
} as const

export type ProductManageTab =
  (typeof PRODUCT_MANAGE_TABS)[keyof typeof PRODUCT_MANAGE_TABS]

export const PRODUCT_MANAGE_TAB_LABELS: Record<ProductManageTab, string> = {
  [PRODUCT_MANAGE_TABS.OVERVIEW]: 'SPU overview',
  [PRODUCT_MANAGE_TABS.ATTRIBUTES]: 'Attributes',
  [PRODUCT_MANAGE_TABS.SKUS]: 'SKUs',
}

export const PRODUCT_LIST_QUERY = {
  page: 1,
  limit: 30,
  sort: 'desc' as const,
} as const satisfies ShopProductListQuery

export const WAREHOUSE_LIST_QUERY = {
  page: 1,
  limit: 30,
  sort: 'desc' as const,
}
