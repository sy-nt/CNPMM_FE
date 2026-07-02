import { RBAC_SYSTEM_ROLES } from '#/lib/rbac/constants/system-roles'
import type { ManagerRoleName } from '#/lib/rbac/is-manager-role'

export const MANAGE_OVERVIEW_ROLES = [
  RBAC_SYSTEM_ROLES.ADMIN,
  RBAC_SYSTEM_ROLES.MODERATOR,
  RBAC_SYSTEM_ROLES.SHOP_OWNER,
  RBAC_SYSTEM_ROLES.SHOP_MODERATOR,
  RBAC_SYSTEM_ROLES.SHOP_STAFF,
  RBAC_SYSTEM_ROLES.DELIVERY_AGENT,
] as const satisfies ReadonlyArray<ManagerRoleName>

export const MANAGE_ADMIN_ROLES = [
  RBAC_SYSTEM_ROLES.ADMIN,
] as const satisfies ReadonlyArray<ManagerRoleName>

export const MANAGE_PLATFORM_MODERATOR_ROLES = [
  RBAC_SYSTEM_ROLES.ADMIN,
  RBAC_SYSTEM_ROLES.MODERATOR,
] as const satisfies ReadonlyArray<ManagerRoleName>

export const MANAGE_SHOP_OWNER_ROLES = [
  RBAC_SYSTEM_ROLES.SHOP_OWNER,
] as const satisfies ReadonlyArray<ManagerRoleName>

export const MANAGE_SHOP_WORKER_ROLES = [
  RBAC_SYSTEM_ROLES.SHOP_OWNER,
  RBAC_SYSTEM_ROLES.SHOP_MODERATOR,
] as const satisfies ReadonlyArray<ManagerRoleName>

export const MANAGE_SHOP_ORDER_ROLES = [
  RBAC_SYSTEM_ROLES.SHOP_OWNER,
  RBAC_SYSTEM_ROLES.SHOP_MODERATOR,
  RBAC_SYSTEM_ROLES.SHOP_STAFF,
] as const satisfies ReadonlyArray<ManagerRoleName>

export const MANAGE_SHOP_CATALOG_ROLES = [
  RBAC_SYSTEM_ROLES.SHOP_OWNER,
  RBAC_SYSTEM_ROLES.SHOP_MODERATOR,
  RBAC_SYSTEM_ROLES.SHOP_STAFF,
] as const satisfies ReadonlyArray<ManagerRoleName>

export const MANAGE_DELIVERY_AGENT_ROLES = [
  RBAC_SYSTEM_ROLES.DELIVERY_AGENT,
] as const satisfies ReadonlyArray<ManagerRoleName>
