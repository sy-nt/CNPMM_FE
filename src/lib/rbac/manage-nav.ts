import type { PermissionName } from '#/lib/rbac/constants'
import type { ManagerRoleName } from '#/lib/rbac/is-manager-role'

export type ManageNavPermissionFilter = {
  all?: ReadonlyArray<PermissionName>
  any?: ReadonlyArray<PermissionName>
  roles?: ReadonlyArray<ManagerRoleName>
}

function _hasAnyPermission(
  owned: ReadonlyArray<string>,
  required: ReadonlyArray<PermissionName>,
): boolean {
  if (required.length === 0) return true
  return required.some((permission) => owned.includes(permission))
}

function _hasAllPermissions(
  owned: ReadonlyArray<string>,
  required: ReadonlyArray<PermissionName>,
): boolean {
  if (required.length === 0) return true
  return required.every((permission) => owned.includes(permission))
}

function _hasAllowedRole(
  roleName: string | null | undefined,
  allowed: ReadonlyArray<ManagerRoleName> | undefined,
): boolean {
  if (!allowed || allowed.length === 0) return true
  if (!roleName) return false
  return allowed.includes(roleName as ManagerRoleName)
}

export function filterManageNavItems<T extends ManageNavPermissionFilter>(
  items: ReadonlyArray<T>,
  permissions: ReadonlyArray<string>,
  roleName?: string | null,
): ReadonlyArray<T> {
  return items.filter((item) => {
    const roleOk = _hasAllowedRole(roleName, item.roles)
    const allOk = _hasAllPermissions(permissions, item.all ?? [])
    const anyOk = _hasAnyPermission(permissions, item.any ?? [])
    return roleOk && allOk && anyOk
  })
}
