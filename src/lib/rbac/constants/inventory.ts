import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_INVENTORY_ACTIONS = {
  ADJUST: 'adjust',
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_INVENTORY_MODULES = {
  INVENTORY: 'inventory',
} as const

export const INVENTORY_PERMISSIONS = buildModulePermissionsMap(
  RBAC_INVENTORY_MODULES,
  RBAC_INVENTORY_ACTIONS,
)
