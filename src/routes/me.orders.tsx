import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { LoadingFallback } from '#/components/loading-fallback'
import type { OrderStatusTab } from '#/lib/api/order.constants'
import {
  ORDER_LIST_DEFAULT_QUERY,
  ORDER_STATUS_ALL,
  ORDER_STATUSES,
} from '#/lib/api/order.constants'
import { ApiError } from '#/lib/api/client'
import { orderListQueryOptions } from '#/lib/query/order'
import type { OrderListResponse } from '#/lib/schemas/order.schema'
import { OrdersPage } from '#/pages/me/orders-page'
import { authStore } from '#/stores/auth.store'

const ordersSearchSchema = z.object({
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

export type MeOrdersLoaderResult = {
  orders: OrderListResponse
  page: number
  totalPage: number
  status: OrderStatusTab
}

export const Route = createFileRoute('/me/orders')({
  validateSearch: (search) => ordersSearchSchema.parse(search),
  component: OrdersPage,
  pendingComponent: () => (
    <LoadingFallback variant="inline" label="Loading orders…" />
  ),
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    status: search.status ?? ORDER_STATUS_ALL,
  }),
  loader: async ({ context, deps }): Promise<MeOrdersLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    const status = deps.status

    try {
      const orders = await context.queryClient.ensureQueryData(
        orderListQueryOptions(accessToken, {
          ...ORDER_LIST_DEFAULT_QUERY,
          page: deps.page,
          ...(status === ORDER_STATUS_ALL ? {} : { status }),
        }),
      )
      return {
        orders,
        page: orders.currentPage,
        totalPage: orders.totalPage,
        status,
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        throw redirect({ to: '/sign-in' })
      }
      throw error
    }
  },
})
