import { createFileRoute } from '@tanstack/react-router'

import { guardManageShopProfile } from '#/lib/rbac/manage-route-guards'
import { ShopProfilePage } from '#/pages/manage/shop/shop-profile-page'

export const Route = createFileRoute('/manage/shop/')({
  beforeLoad: guardManageShopProfile,
  component: ShopProfilePage,
})
