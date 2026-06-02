import type { ReactNode } from 'react'

import type { PermissionName } from '#/lib/rbac/constants'
import {
  useHasAllPermissions,
} from '#/lib/rbac/hooks'

type RequirePermissionProps = {
  /** All listed permissions must be present (AND). */
  all?: ReadonlyArray<PermissionName>
  /** Any of the listed permissions is sufficient (OR). */
  any?: ReadonlyArray<PermissionName>
  /** Rendered when the caller lacks the required permissions. Default: `null`. */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Conditionally renders `children` based on the caller's RBAC permissions.
 * Combine `all` and `any` for compound checks — both must pass.
 *
 * @example
 * <RequirePermission all={[ROLE_PERMISSIONS.role_read]}>
 *   <RolesTable />
 * </RequirePermission>
 */
export function RequirePermission({
  all,
  fallback = null,
  children,
}: RequirePermissionProps): ReactNode {
  const allOk = useHasAllPermissions(all ?? [])
  return allOk ? children : fallback
}
