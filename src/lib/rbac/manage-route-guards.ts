import {
  CATEGORY_PERMISSIONS,
  DELIVERY_PERMISSIONS,
  DISCOUNT_PERMISSIONS,
  INVENTORY_PERMISSIONS,
  ORDER_PERMISSIONS,
  PRODUCT_PERMISSIONS,
  ROLE_PERMISSIONS,
  SHOP_ADDRESS_PERMISSIONS,
  SHOP_PERMISSIONS,
  SHOP_STAFF_PERMISSIONS,
  USER_PERMISSIONS,
  WAREHOUSE_PERMISSIONS,
} from '#/lib/rbac/constants'
import { ensureManageAccess } from '#/lib/rbac/guards'
import {
  MANAGE_ADMIN_ROLES,
  MANAGE_DELIVERY_AGENT_ROLES,
  MANAGE_PLATFORM_MODERATOR_ROLES,
  MANAGE_SHOP_CATALOG_ROLES,
  MANAGE_SHOP_ORDER_ROLES,
  MANAGE_SHOP_OWNER_ROLES,
  MANAGE_SHOP_WORKER_ROLES,
} from '#/lib/rbac/manage-roles'

export const guardManageRoles = ensureManageAccess({
  anyPermissions: [ROLE_PERMISSIONS.ROLE_READ],
  anyRoles: MANAGE_ADMIN_ROLES,
})

export const guardManageModerators = ensureManageAccess({
  anyPermissions: [USER_PERMISSIONS.USER_READ],
  anyRoles: MANAGE_ADMIN_ROLES,
})

export const guardManageShops = ensureManageAccess({
  anyPermissions: [SHOP_PERMISSIONS.SHOP_READ, SHOP_PERMISSIONS.SHOP_VERIFY],
  anyRoles: MANAGE_PLATFORM_MODERATOR_ROLES,
})

export const guardManageCategories = ensureManageAccess({
  anyPermissions: [CATEGORY_PERMISSIONS.CATEGORY_READ],
  anyRoles: MANAGE_ADMIN_ROLES,
})

export const guardManageDiscounts = ensureManageAccess({
  anyPermissions: [DISCOUNT_PERMISSIONS.DISCOUNT_READ],
  anyRoles: MANAGE_ADMIN_ROLES,
})

export const guardManageDeliveryConfig = ensureManageAccess({
  anyPermissions: [
    DELIVERY_PERMISSIONS.DELIVERY_METHOD_READ,
    DELIVERY_PERMISSIONS.DELIVERY_ZONE_READ,
    DELIVERY_PERMISSIONS.DELIVERY_RATE_READ,
  ],
  anyRoles: MANAGE_DELIVERY_AGENT_ROLES,
})

export const guardManageDeliveries = ensureManageAccess({
  anyPermissions: [
    DELIVERY_PERMISSIONS.DELIVERY_READ,
    DELIVERY_PERMISSIONS.DELIVERY_UPDATE_STATUS,
  ],
  anyRoles: MANAGE_DELIVERY_AGENT_ROLES,
})

export const guardManageShopProfile = ensureManageAccess({
  anyPermissions: [SHOP_PERMISSIONS.SHOP_READ, SHOP_PERMISSIONS.SHOP_UPDATE],
  anyRoles: MANAGE_SHOP_OWNER_ROLES,
})

export const guardManageShopAddresses = ensureManageAccess({
  anyPermissions: [SHOP_ADDRESS_PERMISSIONS.SHOP_ADDRESS_READ],
  anyRoles: MANAGE_SHOP_OWNER_ROLES,
})

export const guardManageShopWorkers = ensureManageAccess({
  anyPermissions: [
    SHOP_STAFF_PERMISSIONS.SHOP_STAFF_READ,
    SHOP_STAFF_PERMISSIONS.SHOP_STAFF_ASSIGN,
  ],
  anyRoles: MANAGE_SHOP_WORKER_ROLES,
})

export const guardManageShopOrders = ensureManageAccess({
  anyPermissions: [ORDER_PERMISSIONS.ORDER_READ],
  anyRoles: MANAGE_SHOP_ORDER_ROLES,
})

export const guardManageShopWarehouses = ensureManageAccess({
  anyPermissions: [WAREHOUSE_PERMISSIONS.WAREHOUSE_READ],
  anyRoles: MANAGE_SHOP_OWNER_ROLES,
})

export const guardManageShopProducts = ensureManageAccess({
  anyPermissions: [PRODUCT_PERMISSIONS.PRODUCT_READ],
  anyRoles: MANAGE_SHOP_CATALOG_ROLES,
})

export const guardManageShopInventory = ensureManageAccess({
  anyPermissions: [INVENTORY_PERMISSIONS.INVENTORY_READ],
  anyRoles: MANAGE_SHOP_CATALOG_ROLES,
})
