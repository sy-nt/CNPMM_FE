import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { OrderStatusTransitionActions } from '#/components/manage/order-status-transition-actions'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import {
  ORDER_CANCEL_REASON,
  ORDER_LIST_DEFAULT_QUERY,
  ORDER_STATUS_LABELS,
} from '#/lib/api/order.constants'
import type { OrderStatus } from '#/lib/api/order.constants'
import { cancelOrder, updateOrderStatus } from '#/lib/api/order'
import type { OrderListQuery } from '#/lib/api/order'
import { ADMIN_SHOP_LIST_DEFAULT_QUERY } from '#/lib/api/shop.constants'
import { formatDateTime } from '#/lib/datetime'
import { formatPrice } from '#/lib/format'
import { adminShopListQueryOptions } from '#/lib/query/shop'
import { orderListQueryOptions } from '#/lib/query/order'
import { cn } from '#/lib/utils'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const ORDER_SHOP_FILTER_ALL = 'all' as const

export function PlatformOrdersPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [shopFilter, setShopFilter] = useState<string>(ORDER_SHOP_FILTER_ALL)

  const shopsQuery = useQuery(
    adminShopListQueryOptions(accessToken, {
      ...ADMIN_SHOP_LIST_DEFAULT_QUERY,
      status: undefined,
    }),
  )

  const listQuery = useMemo((): OrderListQuery => {
    if (shopFilter === ORDER_SHOP_FILTER_ALL) {
      return ORDER_LIST_DEFAULT_QUERY
    }
    return { ...ORDER_LIST_DEFAULT_QUERY, shopId: shopFilter }
  }, [shopFilter])

  const ordersQuery = useQuery(orderListQueryOptions(accessToken, listQuery))
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(accessToken, orderId, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
  const cancelMutation = useMutation({
    mutationFn: (orderId: string) =>
      cancelOrder(
        accessToken,
        orderId,
        { reason: ORDER_CANCEL_REASON },
        { idempotencyKey: crypto.randomUUID() },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const handleStatusChange = async (
    orderId: string,
    status: OrderStatus,
  ): Promise<void> => {
    if (updateStatusMutation.isPending) return
    try {
      await updateStatusMutation.mutateAsync({ orderId, status })
      toast.success('Order status updated.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not update order status.'))
    }
  }

  const handleCancelOrder = async (orderId: string): Promise<void> => {
    if (cancelMutation.isPending) return
    try {
      await cancelMutation.mutateAsync(orderId)
      toast.success('Order cancelled.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not cancel order.'))
    }
  }

  const shopOptions = shopsQuery.data?.items ?? []

  return (
    <ManageSection
      title="Orders"
      description="Review platform orders and perform status operations."
      actions={
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order-shop-filter" className="text-xs">
            Filter by shop
          </Label>
          <select
            id="order-shop-filter"
            value={shopFilter}
            onChange={(event) => setShopFilter(event.target.value)}
            className={cn(
              'h-9 rounded-md border border-input bg-background px-3 text-sm',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            )}
          >
            <option value={ORDER_SHOP_FILTER_ALL}>All shops</option>
            {shopOptions.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <ManageAsyncState
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
        isEmpty={(ordersQuery.data?.items.length ?? 0) === 0}
        emptyTitle="No orders found"
        emptyDescription="Orders will appear here once customers check out."
      >
        <div className="grid gap-4">
          {ordersQuery.data?.items.map((order) => {
            const pendingStatusMutation =
              updateStatusMutation.isPending &&
              updateStatusMutation.variables?.orderId === order.id
                ? updateStatusMutation.variables.status
                : null
            const pendingCancelMutation =
              cancelMutation.isPending && cancelMutation.variables === order.id
            const statusLabel = _getOrderStatusLabel(order.status)

            return (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="text-base">{order.id}</CardTitle>
                  <CardDescription>
                    {formatDateTime(order.createdAt) ?? 'Date unavailable'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{statusLabel}</Badge>
                    <p className="text-sm text-muted-foreground">
                      Total:{' '}
                      {formatPrice(order.totalAmount) ?? order.totalAmount}
                    </p>
                  </div>

                  <OrderStatusTransitionActions
                    currentStatus={order.status}
                    pendingStatus={pendingStatusMutation}
                    pendingCancel={pendingCancelMutation}
                    onAdvanceStatus={(status) =>
                      void handleStatusChange(order.id, status)
                    }
                    onCancelOrder={() => void handleCancelOrder(order.id)}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ManageAsyncState>
    </ManageSection>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}

function _getOrderStatusLabel(status: string): string {
  return (
    ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status
  )
}
