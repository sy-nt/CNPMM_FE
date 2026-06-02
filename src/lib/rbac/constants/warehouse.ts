import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_WAREHOUSE_ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_WAREHOUSE_MODULES = {
  WAREHOUSE: 'warehouse',
} as const

export const WAREHOUSE_PERMISSIONS = buildModulePermissionsMap(
  RBAC_WAREHOUSE_MODULES,
  RBAC_WAREHOUSE_ACTIONS,
)
