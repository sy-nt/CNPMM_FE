import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_CATEGORY_ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_CATEGORY_MODULES = {
  CATEGORY: 'category',
} as const

export const CATEGORY_PERMISSIONS = buildModulePermissionsMap(
  RBAC_CATEGORY_MODULES,
  RBAC_CATEGORY_ACTIONS,
)
