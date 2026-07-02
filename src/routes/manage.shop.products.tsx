import { createFileRoute } from '@tanstack/react-router'

import { guardManageShopProducts } from '#/lib/rbac/manage-route-guards'
import { ShopProductsPage } from '#/pages/manage/shop/products-page'

export const Route = createFileRoute('/manage/shop/products')({
  beforeLoad: guardManageShopProducts,
  component: ShopProductsPage,
})
