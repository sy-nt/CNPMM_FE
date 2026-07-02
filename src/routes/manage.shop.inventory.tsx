import { createFileRoute } from '@tanstack/react-router'

import { guardManageShopInventory } from '#/lib/rbac/manage-route-guards'
import { ShopInventoryPage } from '#/pages/manage/shop/inventory-page'

export const Route = createFileRoute('/manage/shop/inventory')({
  beforeLoad: guardManageShopInventory,
  component: ShopInventoryPage,
})
