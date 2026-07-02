import { createFileRoute } from '@tanstack/react-router'

import { ShopPage } from '#/pages/me/shop-page'

export const Route = createFileRoute('/me/shop')({
  component: ShopPage,
})
