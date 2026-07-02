/** Mirrors `RBAC_SYSTEM_ROLES` in the backend (`Be/src/shared/lib/rbac/rbac.constants.ts`). */
export const RBAC_SYSTEM_ROLES = {
  ADMIN: 'admin',
  DELIVERY_AGENT: 'delivery_agent',
  GUEST: 'guest',
  MODERATOR: 'moderator',
  SHOP_MODERATOR: 'shop_moderator',
  SHOP_OWNER: 'shop_owner',
  SHOP_STAFF: 'shop_staff',
  USER: 'user',
} as const

export type SystemRoleName =
  (typeof RBAC_SYSTEM_ROLES)[keyof typeof RBAC_SYSTEM_ROLES]

export const MANAGER_ROLE_NAMES = [
  RBAC_SYSTEM_ROLES.ADMIN,
  RBAC_SYSTEM_ROLES.MODERATOR,
  RBAC_SYSTEM_ROLES.SHOP_OWNER,
  RBAC_SYSTEM_ROLES.SHOP_STAFF,
  RBAC_SYSTEM_ROLES.SHOP_MODERATOR,
  RBAC_SYSTEM_ROLES.DELIVERY_AGENT,
] as const satisfies ReadonlyArray<SystemRoleName>
