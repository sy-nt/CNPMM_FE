import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_ROLE_ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_ROLE_MODULES = {
  PERMISSION: 'permission',
  ROLE: 'role',
} as const

export const ROLE_PERMISSIONS = buildModulePermissionsMap(
  RBAC_ROLE_MODULES,
  RBAC_ROLE_ACTIONS,
)
