import { createFileRoute } from '@tanstack/react-router'

import { guardManageShopWorkers } from '#/lib/rbac/manage-route-guards'
import { ShopWorkersPage } from '#/pages/manage/shop/workers-page'

export const Route = createFileRoute('/manage/shop/workers')({
  beforeLoad: guardManageShopWorkers,
  component: ShopWorkersPage,
})
