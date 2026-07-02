import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_NOTIFICATION_ACTIONS = {
  READ: 'read',
  UPDATE: 'update',
} as const

export const RBAC_NOTIFICATION_MODULES = {
  NOTIFICATION: 'notification',
} as const

export const NOTIFICATION_PERMISSIONS = buildModulePermissionsMap(
  RBAC_NOTIFICATION_MODULES,
  RBAC_NOTIFICATION_ACTIONS,
)
