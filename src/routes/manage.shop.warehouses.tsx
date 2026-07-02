import { createFileRoute } from '@tanstack/react-router'

import { guardManageShopWarehouses } from '#/lib/rbac/manage-route-guards'
import { ShopWarehousesPage } from '#/pages/manage/shop/warehouses-page'

export const Route = createFileRoute('/manage/shop/warehouses')({
  beforeLoad: guardManageShopWarehouses,
  component: ShopWarehousesPage,
})
