import type { ReactNode } from 'react'

import { ManageSection } from '#/pages/manage/_manage-section'
import { DeliveryOrdersPanel } from '#/pages/manage/delivery/_delivery-orders-panel'

export function DeliveriesPage(): ReactNode {
  return (
    <ManageSection
      title="Deliveries"
      description="Review orders and advance fulfillment statuses."
    >
      <DeliveryOrdersPanel />
    </ManageSection>
  )
}
