import { createFileRoute } from '@tanstack/react-router'

import { guardManageDiscounts } from '#/lib/rbac/manage-route-guards'
import { DiscountsPage } from '#/pages/manage/platform/discounts-page'

export const Route = createFileRoute('/manage/discounts')({
  beforeLoad: guardManageDiscounts,
  component: DiscountsPage,
})
