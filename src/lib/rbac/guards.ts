import { redirect } from '@tanstack/react-router'

import type { PermissionName } from '#/lib/rbac/constants'
import type { ManagerRoleName } from '#/lib/rbac/is-manager-role'
import { isManagerRoleName } from '#/lib/rbac/is-manager-role'
import {
  authStore,
  hasAllPermissions,
  hasAnyPermission,
  selectIsAuthenticated,
} from '#/stores/auth.store'

export type EnsurePermissionOptions = {
  all?: ReadonlyArray<PermissionName>
  any?: ReadonlyArray<PermissionName>
  redirectTo?: '/' | '/sign-in' | '/forbidden'
}

export type EnsureRoleOptions = {
  any?: ReadonlyArray<ManagerRoleName>
  redirectTo?: '/' | '/sign-in' | '/forbidden'
}

export type EnsureManageAccessOptions = {
  all?: ReadonlyArray<PermissionName>
  anyPermissions?: ReadonlyArray<PermissionName>
  anyRoles?: ReadonlyArray<ManagerRoleName>
  redirectTo?: '/' | '/sign-in' | '/forbidden'
}

export function ensurePermission(options: EnsurePermissionOptions): () => void {
  const { all, any, redirectTo = '/forbidden' } = options
  return () => {
    const state = authStore.state
    if (!selectIsAuthenticated(state)) {
      throw redirect({ to: '/sign-in' })
    }
    if (all && !hasAllPermissions(state, all)) {
      throw redirect({ to: redirectTo })
    }
    if (any && !hasAnyPermission(state, any)) {
      throw redirect({ to: redirectTo })
    }
  }
}

export function ensureManagerRole(): void {
  const state = authStore.state
  if (!selectIsAuthenticated(state)) {
    throw redirect({ to: '/sign-in' })
  }
  if (!isManagerRoleName(state.role?.name)) {
    throw redirect({ to: '/forbidden' })
  }
}

export function ensureRole(options: EnsureRoleOptions): () => void {
  const { any: allowedRoles, redirectTo = '/forbidden' } = options
  return () => {
    const state = authStore.state
    if (!selectIsAuthenticated(state)) {
      throw redirect({ to: '/sign-in' })
    }
    const roleName = state.role?.name
    if (!isManagerRoleName(roleName)) {
      throw redirect({ to: redirectTo })
    }
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(roleName)) {
      throw redirect({ to: redirectTo })
    }
  }
}

export function ensureManageAccess(
  options: EnsureManageAccessOptions,
): () => void {
  return () => {
    ensurePermission({
      all: options.all,
      any: options.anyPermissions,
      redirectTo: options.redirectTo,
    })()
    ensureRole({
      any: options.anyRoles,
      redirectTo: options.redirectTo,
    })()
  }
}
