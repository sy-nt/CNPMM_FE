import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const SHOP_PERMISSIONS = buildModulePermissionsMap(
  { SHOP: 'shop' } as const,
  {
    DELETE: 'delete',
    READ: 'read',
    REGISTER: 'register',
    UPDATE: 'update',
    VERIFY: 'verify',
  } as const,
)

export const SHOP_CATALOG_PERMISSIONS = buildModulePermissionsMap(
  { SHOP_CATALOG: 'shop_catalog' } as const,
  {
    CREATE: 'create',
    DELETE: 'delete',
    READ: 'read',
    UPDATE: 'update',
  } as const,
)

export const SHOP_DISCOUNT_PERMISSIONS = buildModulePermissionsMap(
  { SHOP_DISCOUNT: 'shop_discount' } as const,
  {
    CREATE: 'create',
    DELETE: 'delete',
    READ: 'read',
    UPDATE: 'update',
  } as const,
)

export const SHOP_MODERATOR_PERMISSIONS = buildModulePermissionsMap(
  { SHOP_MODERATOR: 'shop_moderator' } as const,
  {
    ASSIGN: 'assign',
    READ: 'read',
    UNASSIGN: 'unassign',
  } as const,
)

export const SHOP_STAFF_PERMISSIONS = buildModulePermissionsMap(
  { SHOP_STAFF: 'shop_staff' } as const,
  {
    ASSIGN: 'assign',
    READ: 'read',
    UNASSIGN: 'unassign',
  } as const,
)

export const SHOP_ADDRESS_PERMISSIONS = buildModulePermissionsMap(
  { SHOP_ADDRESS: 'shop_address' } as const,
  {
    CREATE: 'create',
    DELETE: 'delete',
    READ: 'read',
    UPDATE: 'update',
  } as const,
)
