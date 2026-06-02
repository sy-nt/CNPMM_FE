import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_DELIVERY_ACTIONS = {
  CREATE: 'create',
  DELETE: 'delete',
  QUOTE: 'quote',
  READ: 'read',
  UPDATE: 'update',
  UPDATE_STATUS: 'update_status',
} as const

export const RBAC_DELIVERY_MODULES = {
  DELIVERY: 'delivery',
  DELIVERY_METHOD: 'delivery_method',
  DELIVERY_RATE: 'delivery_rate',
  DELIVERY_ZONE: 'delivery_zone',
} as const

export const DELIVERY_PERMISSIONS = buildModulePermissionsMap(
  RBAC_DELIVERY_MODULES,
  RBAC_DELIVERY_ACTIONS,
)
