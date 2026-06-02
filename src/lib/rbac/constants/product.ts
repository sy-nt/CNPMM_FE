import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_PRODUCT_ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_PRODUCT_MODULES = {
  PRODUCT: 'product',
} as const

export const PRODUCT_PERMISSIONS = buildModulePermissionsMap(
  RBAC_PRODUCT_MODULES,
  RBAC_PRODUCT_ACTIONS,
)
