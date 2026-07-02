import type { CategoryListQuery, CategoryTreeQuery } from '#/lib/api/category'
import type { DeliveryListQuery } from '#/lib/api/delivery'
import type { InventoryByWarehouseQuery } from '#/lib/api/inventory'
import type { NotificationListQuery } from '#/lib/api/notification'
import type { ProductListQuery, ShopProductListQuery } from '#/lib/api/product'
import type { RoleListQuery } from '#/lib/api/role'
import type { AdminShopListQuery, ShopListQuery } from '#/lib/api/shop'
import type { AdminUserListQuery } from '#/lib/api/user'
import type { WarehouseListQuery } from '#/lib/api/warehouse'
import { stableJsonKey } from '#/lib/utils'

export const cartKeys = {
  all: ['cart'] as const,
  detail: (accessToken: string) => [...cartKeys.all, accessToken] as const,
  mutations: () => [...cartKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...cartKeys.mutations(), action, accessToken] as const,
}

export const userKeys = {
  all: ['user'] as const,
  current: (accessToken: string) => [...userKeys.all, 'current', accessToken] as const,
  mutations: () => [...userKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...userKeys.mutations(), action, accessToken] as const,
}

export const addressKeys = {
  all: ['address'] as const,
  personal: (accessToken: string) =>
    [...addressKeys.all, 'personal', accessToken] as const,
  shop: (accessToken: string) =>
    [...addressKeys.all, 'shop', accessToken] as const,
  mutations: () => [...addressKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...addressKeys.mutations(), action, accessToken] as const,
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (accessToken: string | null, query: ProductListQuery) =>
    [...productKeys.lists(), accessToken, stableJsonKey(query)] as const,
  shopLists: () => [...productKeys.all, 'shop-list'] as const,
  shopList: (accessToken: string, query: ShopProductListQuery) =>
    [...productKeys.shopLists(), accessToken, stableJsonKey(query)] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (accessToken: string | null, idOrSlug: string) =>
    [...productKeys.details(), accessToken, idOrSlug] as const,
  shopDetails: () => [...productKeys.all, 'shop-detail'] as const,
  shopDetail: (accessToken: string, productId: string) =>
    [...productKeys.shopDetails(), accessToken, productId] as const,
  mutations: () => [...productKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...productKeys.mutations(), action, accessToken] as const,
}

export const shopKeys = {
  all: ['shops'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  list: (accessToken: string | null, query: ShopListQuery) =>
    [...shopKeys.lists(), accessToken, stableJsonKey(query)] as const,
  adminLists: () => [...shopKeys.all, 'admin-list'] as const,
  adminList: (accessToken: string, query: AdminShopListQuery) =>
    [...shopKeys.adminLists(), accessToken, stableJsonKey(query)] as const,
  details: () => [...shopKeys.all, 'detail'] as const,
  detail: (accessToken: string | null, idOrSlug: string) =>
    [...shopKeys.details(), accessToken, idOrSlug] as const,
  workers: (accessToken: string) =>
    [...shopKeys.all, 'workers', accessToken] as const,
  mutations: () => [...shopKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...shopKeys.mutations(), action, accessToken] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (accessToken: string | null, query: CategoryListQuery) =>
    [...categoryKeys.lists(), accessToken, stableJsonKey(query)] as const,
  trees: () => [...categoryKeys.all, 'tree'] as const,
  tree: (
    accessToken: string | null,
    categoryId: string,
    query: CategoryTreeQuery,
  ) =>
    [
      ...categoryKeys.trees(),
      accessToken,
      categoryId,
      stableJsonKey(query),
    ] as const,
  bySlug: (accessToken: string | null, slug: string) =>
    [...categoryKeys.all, 'by-slug', accessToken, slug] as const,
  mutations: () => [...categoryKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...categoryKeys.mutations(), action, accessToken] as const,
}

export const deliveryKeys = {
  all: ['delivery'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  list: (accessToken: string, query: DeliveryListQuery) =>
    [...deliveryKeys.lists(), accessToken, stableJsonKey(query)] as const,
  methods: (accessToken: string) =>
    [...deliveryKeys.all, 'methods', accessToken] as const,
  mutations: () => [...deliveryKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...deliveryKeys.mutations(), action, accessToken] as const,
}

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (accessToken: string, query: NotificationListQuery) =>
    [...notificationKeys.lists(), accessToken, stableJsonKey(query)] as const,
  infinite: (accessToken: string, query: Record<string, unknown>) =>
    [...notificationKeys.lists(), 'infinite', accessToken, stableJsonKey(query)] as const,
  unreadCount: (accessToken: string) =>
    [...notificationKeys.all, 'unread-count', accessToken] as const,
  mutations: () => [...notificationKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...notificationKeys.mutations(), action, accessToken] as const,
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (accessToken: string, query: Record<string, unknown>) =>
    [...orderKeys.lists(), accessToken, stableJsonKey(query)] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (accessToken: string, orderId: string) =>
    [...orderKeys.details(), accessToken, orderId] as const,
  preview: (
    accessToken: string,
    input: Record<string, unknown> | null,
  ) =>
    [
      ...orderKeys.all,
      'preview',
      accessToken,
      stableJsonKey(input ?? {}),
    ] as const,
  mutations: () => [...orderKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...orderKeys.mutations(), action, accessToken] as const,
}

export const discountKeys = {
  all: ['discounts'] as const,
  platformLists: () => [...discountKeys.all, 'platform-list'] as const,
  platformList: (
    accessToken: string | null,
    query: Record<string, unknown>,
  ) =>
    [
      ...discountKeys.platformLists(),
      accessToken,
      stableJsonKey(query),
    ] as const,
  claimLists: () => [...discountKeys.all, 'claim-list'] as const,
  claimList: (accessToken: string, query: Record<string, unknown>) =>
    [...discountKeys.claimLists(), accessToken, stableJsonKey(query)] as const,
  details: () => [...discountKeys.all, 'detail'] as const,
  detail: (accessToken: string | null, discountId: string) =>
    [...discountKeys.details(), accessToken, discountId] as const,
  mutations: () => [...discountKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...discountKeys.mutations(), action, accessToken] as const,
}

export const roleKeys = {
  all: ['roles'] as const,
  my: (accessToken: string) => [...roleKeys.all, 'my', accessToken] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (accessToken: string, query: RoleListQuery) =>
    [...roleKeys.lists(), accessToken, stableJsonKey(query)] as const,
  systemPermissions: (accessToken: string) =>
    [...roleKeys.all, 'system-permissions', accessToken] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (accessToken: string, roleId: string) =>
    [...roleKeys.details(), accessToken, roleId] as const,
  mutations: () => [...roleKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...roleKeys.mutations(), action, accessToken] as const,
}

export const inventoryKeys = {
  all: ['inventory'] as const,
  bySku: (accessToken: string, skuId: string) =>
    [...inventoryKeys.all, 'by-sku', accessToken, skuId] as const,
  byWarehouse: (
    accessToken: string,
    warehouseId: string,
    query: InventoryByWarehouseQuery,
  ) =>
    [
      ...inventoryKeys.all,
      'by-warehouse',
      accessToken,
      warehouseId,
      stableJsonKey(query),
    ] as const,
  mutations: () => [...inventoryKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...inventoryKeys.mutations(), action, accessToken] as const,
}

export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (accessToken: string, query: WarehouseListQuery) =>
    [...warehouseKeys.lists(), accessToken, stableJsonKey(query)] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (accessToken: string, warehouseId: string) =>
    [...warehouseKeys.details(), accessToken, warehouseId] as const,
  mutations: () => [...warehouseKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...warehouseKeys.mutations(), action, accessToken] as const,
}

export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (accessToken: string, query: AdminUserListQuery) =>
    [...adminUserKeys.lists(), accessToken, stableJsonKey(query)] as const,
}

export const adminCategoryKeys = {
  all: ['admin-categories'] as const,
  mutations: () => [...adminCategoryKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...adminCategoryKeys.mutations(), action, accessToken] as const,
}

export const shopCategoryKeys = {
  all: ['shop-categories'] as const,
  mutations: () => [...shopCategoryKeys.all, 'mutation'] as const,
  mutation: (action: string, accessToken: string) =>
    [...shopCategoryKeys.mutations(), action, accessToken] as const,
}
