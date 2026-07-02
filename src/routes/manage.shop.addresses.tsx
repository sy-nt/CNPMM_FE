import { createFileRoute } from '@tanstack/react-router'

import { guardManageShopAddresses } from '#/lib/rbac/manage-route-guards'
import { ShopAddressesPage } from '#/pages/manage/shop/addresses-page'

export const Route = createFileRoute('/manage/shop/addresses')({
  beforeLoad: guardManageShopAddresses,
  component: ShopAddressesPage,
})
