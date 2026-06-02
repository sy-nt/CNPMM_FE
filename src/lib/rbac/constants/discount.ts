import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_DISCOUNT_ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_DISCOUNT_MODULES = {
  DISCOUNT: 'discount',
} as const

export const DISCOUNT_PERMISSIONS = buildModulePermissionsMap(
  RBAC_DISCOUNT_MODULES,
  RBAC_DISCOUNT_ACTIONS,
)
