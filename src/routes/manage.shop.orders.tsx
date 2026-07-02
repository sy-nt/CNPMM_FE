import { createFileRoute } from '@tanstack/react-router'

import { guardManageShopOrders } from '#/lib/rbac/manage-route-guards'
import { ShopOrdersPage } from '#/pages/manage/shop/orders-page'

export const Route = createFileRoute('/manage/shop/orders')({
  beforeLoad: guardManageShopOrders,
  component: ShopOrdersPage,
})
