import { MANAGER_ROLE_NAMES } from '#/lib/rbac/constants/system-roles'

const _MANAGER_ROLE_NAME_SET = new Set<string>(MANAGER_ROLE_NAMES)

export type ManagerRoleName = (typeof MANAGER_ROLE_NAMES)[number]

export function isManagerRoleName(
  roleName: string | null | undefined,
): roleName is ManagerRoleName {
  if (!roleName) return false
  return _MANAGER_ROLE_NAME_SET.has(roleName)
}
