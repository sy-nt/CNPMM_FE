import type { LucideIcon } from 'lucide-react'
import {
  Boxes,
  FolderTree,
  LayoutDashboard,
  MapPin,
  Package,
  PackageSearch,
  Shield,
  Store,
  TicketPercent,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react'

import type { ManageNavPermissionFilter } from '#/lib/rbac/manage-nav'
import {
  MANAGE_ADMIN_ROLES,
  MANAGE_DELIVERY_AGENT_ROLES,
  MANAGE_OVERVIEW_ROLES,
  MANAGE_PLATFORM_MODERATOR_ROLES,
  MANAGE_SHOP_CATALOG_ROLES,
  MANAGE_SHOP_ORDER_ROLES,
  MANAGE_SHOP_OWNER_ROLES,
  MANAGE_SHOP_WORKER_ROLES,
} from '#/lib/rbac/manage-roles'
import {
  CATEGORY_PERMISSIONS,
  DELIVERY_PERMISSIONS,
  DISCOUNT_PERMISSIONS,
  INVENTORY_PERMISSIONS,
  ORDER_PERMISSIONS,
  PRODUCT_PERMISSIONS,
  ROLE_PERMISSIONS,
  SHOP_ADDRESS_PERMISSIONS,
  SHOP_PERMISSIONS,
  SHOP_STAFF_PERMISSIONS,
  USER_PERMISSIONS,
  WAREHOUSE_PERMISSIONS,
} from '#/lib/rbac/constants'

export type ManageNavItem = ManageNavPermissionFilter & {
  to:
    | '/manage'
    | '/manage/roles'
    | '/manage/moderators'
    | '/manage/categories'
    | '/manage/discounts'
    | '/manage/shops'
    | '/manage/delivery'
    | '/manage/deliveries'
    | '/manage/shop'
    | '/manage/shop/addresses'
    | '/manage/shop/workers'
    | '/manage/shop/products'
    | '/manage/shop/inventory'
    | '/manage/shop/warehouses'
    | '/manage/shop/orders'
  label: string
  description: string
  icon: LucideIcon
  exact?: boolean
  section: 'platform' | 'shop'
}

export const MANAGE_NAV_ITEMS: ReadonlyArray<ManageNavItem> = [
  {
    to: '/manage',
    label: 'Overview',
    description: 'Modules available for your role',
    icon: LayoutDashboard,
    exact: true,
    section: 'platform',
    roles: MANAGE_OVERVIEW_ROLES,
  },
  {
    to: '/manage/roles',
    label: 'Roles',
    description: 'Permission sets and role administration',
    icon: Shield,
    section: 'platform',
    roles: MANAGE_ADMIN_ROLES,
    any: [ROLE_PERMISSIONS.ROLE_READ],
  },
  {
    to: '/manage/moderators',
    label: 'Platform moderators',
    description: 'Assign and unassign platform moderators',
    icon: Users,
    section: 'platform',
    roles: MANAGE_ADMIN_ROLES,
    any: [USER_PERMISSIONS.USER_READ],
  },
  {
    to: '/manage/shops',
    label: 'Shop approval',
    description: 'Review and approve shop registrations',
    icon: Store,
    section: 'platform',
    roles: MANAGE_PLATFORM_MODERATOR_ROLES,
    any: [SHOP_PERMISSIONS.SHOP_READ, SHOP_PERMISSIONS.SHOP_VERIFY],
  },
  {
    to: '/manage/categories',
    label: 'Categories',
    description: 'Platform product taxonomy',
    icon: FolderTree,
    section: 'platform',
    roles: MANAGE_ADMIN_ROLES,
    any: [CATEGORY_PERMISSIONS.CATEGORY_READ],
  },
  {
    to: '/manage/discounts',
    label: 'Discounts',
    description: 'Platform-wide offers and campaigns',
    icon: TicketPercent,
    section: 'platform',
    roles: MANAGE_ADMIN_ROLES,
    any: [DISCOUNT_PERMISSIONS.DISCOUNT_READ],
  },
  {
    to: '/manage/delivery',
    label: 'Delivery config',
    description: 'Methods, zones, and rate tables',
    icon: Truck,
    section: 'platform',
    roles: MANAGE_DELIVERY_AGENT_ROLES,
    any: [
      DELIVERY_PERMISSIONS.DELIVERY_METHOD_READ,
      DELIVERY_PERMISSIONS.DELIVERY_ZONE_READ,
      DELIVERY_PERMISSIONS.DELIVERY_RATE_READ,
    ],
  },
  {
    to: '/manage/deliveries',
    label: 'Deliveries',
    description: 'Shipment tracking and last-mile operations',
    icon: Truck,
    section: 'platform',
    roles: MANAGE_DELIVERY_AGENT_ROLES,
    any: [
      DELIVERY_PERMISSIONS.DELIVERY_READ,
      DELIVERY_PERMISSIONS.DELIVERY_UPDATE_STATUS,
    ],
  },
  {
    to: '/manage/shop',
    label: 'Shop profile',
    description: 'Your shop identity and settings',
    icon: Store,
    exact: true,
    section: 'shop',
    roles: MANAGE_SHOP_OWNER_ROLES,
    any: [
      SHOP_PERMISSIONS.SHOP_READ,
      SHOP_PERMISSIONS.SHOP_UPDATE,
    ],
  },
  {
    to: '/manage/shop/addresses',
    label: 'Shop addresses',
    description: 'Pickup and fulfillment locations',
    icon: MapPin,
    section: 'shop',
    roles: MANAGE_SHOP_OWNER_ROLES,
    any: [SHOP_ADDRESS_PERMISSIONS.SHOP_ADDRESS_READ],
  },
  {
    to: '/manage/shop/workers',
    label: 'Shop workers',
    description: 'Assign and manage shop staff',
    icon: UserCog,
    section: 'shop',
    roles: MANAGE_SHOP_WORKER_ROLES,
    any: [
      SHOP_STAFF_PERMISSIONS.SHOP_STAFF_READ,
      SHOP_STAFF_PERMISSIONS.SHOP_STAFF_ASSIGN,
    ],
  },
  {
    to: '/manage/shop/orders',
    label: 'Shop orders',
    description: 'Incoming orders and fulfillment',
    icon: Package,
    section: 'shop',
    roles: MANAGE_SHOP_ORDER_ROLES,
    any: [ORDER_PERMISSIONS.ORDER_READ],
  },
  {
    to: '/manage/shop/warehouses',
    label: 'Shop warehouses',
    description: 'Storage sites tied to your shop',
    icon: Warehouse,
    section: 'shop',
    roles: MANAGE_SHOP_OWNER_ROLES,
    any: [WAREHOUSE_PERMISSIONS.WAREHOUSE_READ],
  },
  {
    to: '/manage/shop/products',
    label: 'Shop products',
    description: 'Listings, SKUs, and merchandising',
    icon: PackageSearch,
    section: 'shop',
    roles: MANAGE_SHOP_CATALOG_ROLES,
    any: [PRODUCT_PERMISSIONS.PRODUCT_READ],
  },
  {
    to: '/manage/shop/inventory',
    label: 'Shop inventory',
    description: 'Stock on hand and adjustments',
    icon: Boxes,
    section: 'shop',
    roles: MANAGE_SHOP_CATALOG_ROLES,
    any: [INVENTORY_PERMISSIONS.INVENTORY_READ],
  },
] as const

export const MANAGE_HUB_NAV_ITEMS = MANAGE_NAV_ITEMS.filter(
  (item) => item.to !== '/manage',
)
