import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_USER_ACTIONS = {
  BLOCK: 'block',
  CREATE: 'create',
  DEACTIVATE: 'deactivate',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_USER_MODULES = {
  USER: 'user',
} as const

export const USER_PERMISSIONS = buildModulePermissionsMap(
  RBAC_USER_MODULES,
  RBAC_USER_ACTIONS,
)
