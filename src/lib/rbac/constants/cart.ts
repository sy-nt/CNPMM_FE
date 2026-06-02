import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_CART_ACTIONS = {
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_CART_MODULES = {
  CART: 'cart',
} as const

export const CART_PERMISSIONS = buildModulePermissionsMap(
  RBAC_CART_MODULES,
  RBAC_CART_ACTIONS,
)
