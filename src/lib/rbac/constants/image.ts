import { buildModulePermissionsMap } from '#/lib/rbac/utils'

export const RBAC_IMAGE_ACTIONS = {
  CREATE_PRESIGNED_URL: 'create-presigned-url',
  DELETE: 'delete',
  READ: 'read',
  UPLOAD: 'upload',
} as const

export const RBAC_IMAGE_MODULES = {
  IMAGE: 'image',
} as const

export const IMAGE_PERMISSIONS = buildModulePermissionsMap(
  RBAC_IMAGE_MODULES,
  RBAC_IMAGE_ACTIONS,
)
