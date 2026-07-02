import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import {
  ORDER_STATUS_ALL,
  ORDER_STATUSES,
} from '#/lib/api/order.constants'
import { guardManageDeliveries } from '#/lib/rbac/manage-route-guards'
import { DeliveriesPage } from '#/pages/manage/delivery/deliveries-page'

const deliveriesSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  status: z
    .enum([
      ORDER_STATUS_ALL,
      ORDER_STATUSES.PENDING,
      ORDER_STATUSES.CONFIRMED,
      ORDER_STATUSES.PROCESSING,
      ORDER_STATUSES.SHIPPED,
      ORDER_STATUSES.DELIVERED,
      ORDER_STATUSES.COMPLETED,
      ORDER_STATUSES.CANCELLED,
    ])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/manage/deliveries')({
  beforeLoad: guardManageDeliveries,
  validateSearch: (search) => deliveriesSearchSchema.parse(search),
  component: DeliveriesPage,
})
