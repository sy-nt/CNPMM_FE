import { mergePermissionMaps } from '#/lib/rbac/utils'

import { ADDRESS_PERMISSIONS } from '#/lib/rbac/constants/address'
import { CART_PERMISSIONS } from '#/lib/rbac/constants/cart'
import { CATEGORY_PERMISSIONS } from '#/lib/rbac/constants/category'
import { DELIVERY_PERMISSIONS } from '#/lib/rbac/constants/delivery'
import { DISCOUNT_PERMISSIONS } from '#/lib/rbac/constants/discount'
import { IMAGE_PERMISSIONS } from '#/lib/rbac/constants/image'
import { INVENTORY_PERMISSIONS } from '#/lib/rbac/constants/inventory'
import { ORDER_PERMISSIONS } from '#/lib/rbac/constants/order'
import { PRODUCT_PERMISSIONS } from '#/lib/rbac/constants/product'
import { ROLE_PERMISSIONS } from '#/lib/rbac/constants/role'
import {
  SHOP_ADDRESS_PERMISSIONS,
  SHOP_CATALOG_PERMISSIONS,
  SHOP_DISCOUNT_PERMISSIONS,
  SHOP_MODERATOR_PERMISSIONS,
  SHOP_PERMISSIONS,
  SHOP_STAFF_PERMISSIONS,
} from '#/lib/rbac/constants/shop'
import { USER_PERMISSIONS } from '#/lib/rbac/constants/user'
import { WAREHOUSE_PERMISSIONS } from '#/lib/rbac/constants/warehouse'

export * from '#/lib/rbac/constants/address'
export * from '#/lib/rbac/constants/cart'
export * from '#/lib/rbac/constants/category'
export * from '#/lib/rbac/constants/delivery'
export * from '#/lib/rbac/constants/discount'
export * from '#/lib/rbac/constants/image'
export * from '#/lib/rbac/constants/inventory'
export * from '#/lib/rbac/constants/order'
export * from '#/lib/rbac/constants/product'
export * from '#/lib/rbac/constants/role'
export * from '#/lib/rbac/constants/shop'
export * from '#/lib/rbac/constants/user'
export * from '#/lib/rbac/constants/warehouse'

export const RBAC_PERMISSIONS = mergePermissionMaps(
  ADDRESS_PERMISSIONS,
  CART_PERMISSIONS,
  ROLE_PERMISSIONS,
  SHOP_PERMISSIONS,
  SHOP_CATALOG_PERMISSIONS,
  SHOP_DISCOUNT_PERMISSIONS,
  SHOP_MODERATOR_PERMISSIONS,
  SHOP_STAFF_PERMISSIONS,
  SHOP_ADDRESS_PERMISSIONS,
  USER_PERMISSIONS,
  IMAGE_PERMISSIONS,
  CATEGORY_PERMISSIONS,
  WAREHOUSE_PERMISSIONS,
  PRODUCT_PERMISSIONS,
  INVENTORY_PERMISSIONS,
  DELIVERY_PERMISSIONS,
  DISCOUNT_PERMISSIONS,
  ORDER_PERMISSIONS,
)

export type PermissionName =
  (typeof RBAC_PERMISSIONS)[keyof typeof RBAC_PERMISSIONS]
