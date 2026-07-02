import { createFileRoute } from '@tanstack/react-router'

import { guardManageDeliveryConfig } from '#/lib/rbac/manage-route-guards'
import { DeliveryConfigPage } from '#/pages/manage/platform/delivery-config-page'

export const Route = createFileRoute('/manage/delivery')({
  beforeLoad: guardManageDeliveryConfig,
  component: DeliveryConfigPage,
})
