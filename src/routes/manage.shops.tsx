import { createFileRoute } from '@tanstack/react-router'

import { guardManageShops } from '#/lib/rbac/manage-route-guards'
import { ShopsPage } from '#/pages/manage/platform/shops-page'

export const Route = createFileRoute('/manage/shops')({
  beforeLoad: guardManageShops,
  component: ShopsPage,
})
