import { RBAC_SYSTEM_ROLES } from '#/lib/rbac/constants/system-roles'

export const POST_AUTH_DEFAULT_ROUTE = '/' as const

export const DELIVERY_AGENT_HOME_ROUTE = '/manage/deliveries' as const

export function getPostAuthRedirect(
  roleName: string | null | undefined,
): typeof POST_AUTH_DEFAULT_ROUTE | typeof DELIVERY_AGENT_HOME_ROUTE {
  if (roleName === RBAC_SYSTEM_ROLES.DELIVERY_AGENT) {
    return DELIVERY_AGENT_HOME_ROUTE
  }
  return POST_AUTH_DEFAULT_ROUTE
}
