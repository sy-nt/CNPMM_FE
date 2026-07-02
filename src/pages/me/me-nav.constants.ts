import type { LucideIcon } from 'lucide-react'
import { Bell, MapPin, Package, Store, TicketPercent, User } from 'lucide-react'

export type MeNavItem = {
  to:
    | '/me'
    | '/me/addresses'
    | '/me/discounts'
    | '/me/notifications'
    | '/me/orders'
    | '/me/shop'
  label: string
  description: string
  icon: LucideIcon
  exact?: boolean
}

export const ME_NAV_ITEMS: ReadonlyArray<MeNavItem> = [
  {
    to: '/me',
    label: 'Profile',
    description: 'Name, avatar, and account details',
    icon: User,
    exact: true,
  },
  {
    to: '/me/addresses',
    label: 'Addresses',
    description: 'Delivery destinations for your orders',
    icon: MapPin,
  },
  {
    to: '/me/orders',
    label: 'Orders',
    description: 'Track purchases and order history',
    icon: Package,
  },
  {
    to: '/me/discounts',
    label: 'Discounts',
    description: 'Claimed platform offers and eligibility details',
    icon: TicketPercent,
  },
  {
    to: '/me/notifications',
    label: 'Notifications',
    description: 'Order updates and account alerts',
    icon: Bell,
  },
  {
    to: '/me/shop',
    label: 'Sell on Nexus',
    description: 'Register your shop on the platform',
    icon: Store,
  },
] as const
