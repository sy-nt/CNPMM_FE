import { redirect } from '@tanstack/react-router'

import type { PermissionName } from '#/lib/rbac/constants'
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
