import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_ORDER_ACTIONS = {
  CANCEL: 'cancel',
  PLACE: 'place',
  PREVIEW: 'preview',
  READ: 'read',
  UPDATE_STATUS: 'update_status',
} as const

export const RBAC_ORDER_MODULES = {
  ORDER: 'order',
} as const

export const ORDER_PERMISSIONS = buildModulePermissionsMap(
  RBAC_ORDER_MODULES,
  RBAC_ORDER_ACTIONS,
)
