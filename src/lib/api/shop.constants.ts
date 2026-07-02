import type { AdminShopListQuery, ShopListQuery } from '#/lib/api/shop'

export const SHOP_LIST_PAGE_SIZE = 30

export const SHOP_LIST_DEFAULT_QUERY = {
  page: 1,
  limit: SHOP_LIST_PAGE_SIZE,
  sort: 'desc',
  orderBy: 'createdAt',
} as const satisfies ShopListQuery

export const SHOP_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const

export type ShopStatus = (typeof SHOP_STATUSES)[keyof typeof SHOP_STATUSES]

export const ADMIN_SHOP_LIST_DEFAULT_QUERY = {
  page: 1,
  limit: SHOP_LIST_PAGE_SIZE,
  sort: 'desc',
  orderBy: 'createdAt',
  status: SHOP_STATUSES.PENDING,
} as const satisfies AdminShopListQuery

export const SHOP_PRODUCT_PAGE_SIZE = 24

export const SHOP_DETAILS_ME = 'me' as const
