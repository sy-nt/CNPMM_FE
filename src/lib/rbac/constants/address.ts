import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_ADDRESS_ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_ADDRESS_MODULES = {
  ADDRESS: 'address',
} as const

export const ADDRESS_PERMISSIONS = buildModulePermissionsMap(
  RBAC_ADDRESS_MODULES,
  RBAC_ADDRESS_ACTIONS,
)
