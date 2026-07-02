import { useClientStore } from '#/hooks/use-client-store'
import type { PermissionName } from '#/lib/rbac/constants'
import { isManagerRoleName } from '#/lib/rbac/is-manager-role'
import {
  authStore,
  hasAllPermissions,
  selectPermissions,
  selectRole,
} from '#/stores/auth.store'

const _EMPTY_PERMISSIONS: ReadonlyArray<string> = Object.freeze([])

export function usePermissions(): ReadonlyArray<string> {
  return useClientStore(authStore, selectPermissions, _EMPTY_PERMISSIONS)
}

export function useHasAllPermissions(
  permissions: ReadonlyArray<PermissionName>,
): boolean {
  return useClientStore(
    authStore,
    (state) => hasAllPermissions(state, permissions),
    permissions.length === 0,
  )
}

export function useIsManagerRole(): boolean {
  return useClientStore(
    authStore,
    (state) => isManagerRoleName(state.role?.name),
    false,
  )
}

export function useRoleName(): string | null {
  return useClientStore(authStore, (state) => selectRole(state)?.name ?? null, null)
}
