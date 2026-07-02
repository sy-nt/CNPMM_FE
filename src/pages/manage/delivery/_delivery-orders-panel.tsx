import type { ReactNode } from 'react'
import { useState } from 'react'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

import { ManageDataTable } from '#/components/manage/manage-data-table'
import { ManageOrderDetailDialog } from '#/components/manage/manage-order-detail-dialog'
import { OrderStatusTransitionDropdown } from '#/components/manage/order-status-transition-dropdown'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { ApiError } from '#/lib/api/client'
import {
  ORDER_CANCEL_REASON,
  ORDER_STATUS_ACTORS,
  ORDER_STATUS_ALL,
  ORDER_STATUS_TABS,
  ORDER_STATUS_TONES,
  ORDER_STATUSES,
  isOrderStatus,
} from '#/lib/api/order.constants'
import type { OrderStatus, OrderStatusTab } from '#/lib/api/order.constants'
import { cancelOrder, updateOrderStatus } from '#/lib/api/order'
import { formatDateTime } from '#/lib/datetime'
import { formatPrice } from '#/lib/format'
import { orderKeys } from '#/lib/query/keys'
import { orderListQueryOptions } from '#/lib/query/order'
import type { OrderSummary } from '#/lib/schemas/order.schema'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'
import { cn } from '#/lib/utils'

const _routeApi = getRouteApi('/manage/deliveries')

const ORDER_LIST_BASE_QUERY = {
  limit: MANAGE_TABLE_PAGE_SIZE,
  sort: 'desc' as const,
}

export function DeliveryOrdersPanel(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const search = _routeApi.useSearch()
  const page = search.page ?? 1
  const status: OrderStatusTab = search.status ?? ORDER_STATUS_ALL
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)

  const ordersQuery = useQuery(
    orderListQueryOptions(accessToken, {
      ...ORDER_LIST_BASE_QUERY,
      page,
      ...(status === ORDER_STATUS_ALL ? {} : { status }),
    }),
  )

  const updateStatusMutation = useMutation({
    mutationFn: (input: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(accessToken, input.orderId, { status: input.status }),
    onSuccess: async () => {
      toast.success('Order status updated.')
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
      setPendingOrderId(null)
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not update order status.'))
      setPendingOrderId(null)
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
      toast.success('Order cancelled.')
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
      setPendingOrderId(null)
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not cancel order.'))
      setPendingOrderId(null)
    },
  })

  const rows = ordersQuery.data?.items ?? []
  const totalPage = ordersQuery.data?.totalPage ?? 1
  const total = ordersQuery.data?.total

  const pendingStatus =
    updateStatusMutation.isPending && updateStatusMutation.variables
      ? updateStatusMutation.variables.status
      : null
  const pendingCancel =
    cancelMutation.isPending && cancelMutation.variables !== undefined

  const handleAdvanceStatus = (orderId: string, nextStatus: OrderStatus): void => {
    setPendingOrderId(orderId)
    updateStatusMutation.mutate({ orderId, status: nextStatus })
  }

  const handleCancelOrder = (orderId: string): void => {
    setPendingOrderId(orderId)
    cancelMutation.mutate(orderId)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Orders</h3>
          <p className="text-sm text-muted-foreground">
            Review incoming orders and advance fulfillment statuses.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={ordersQuery.isFetching}
          onClick={() => void ordersQuery.refetch()}
        >
          {ordersQuery.isFetching ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Refreshing…
            </>
          ) : (
            <>
              <RefreshCcw aria-hidden="true" className="size-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <nav
        aria-label="Order status"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {ORDER_STATUS_TABS.map((tab) => {
          const isActive = status === tab.value
          const isCancelledTab = tab.value === ORDER_STATUSES.CANCELLED
          return (
            <Link
              key={tab.value}
              to="/manage/deliveries"
              search={{
                status: tab.value === ORDER_STATUS_ALL ? undefined : tab.value,
                page: undefined,
              }}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                isActive && isCancelledTab
                  ? 'border-destructive/50 bg-destructive/10 text-destructive'
                  : isActive
                    ? 'border-primary bg-primary/10 text-foreground'
                    : isCancelledTab
                      ? 'border-destructive/30 bg-destructive/5 text-destructive hover:border-destructive/50 hover:bg-destructive/10'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <ManageAsyncState
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
        isEmpty={rows.length === 0}
        emptyTitle={
          status === ORDER_STATUS_ALL ? 'No orders found' : `No ${status} orders`
        }
        emptyDescription="Orders assigned to delivery will appear here."
      >
        <ManageDataTable<OrderSummary>
          columns={[
            {
              id: 'id',
              header: 'Order',
              cell: (row) => (
                <span className="font-mono text-xs">
                  {row.id.slice(0, 8).toUpperCase()}
                </span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              cell: (row) => (
                <Badge
                  variant="outline"
                  className={cn(
                    'border-transparent capitalize',
                    isOrderStatus(row.status)
                      ? ORDER_STATUS_TONES[row.status]
                      : undefined,
                    row.status === ORDER_STATUSES.CANCELLED &&
                      'bg-destructive/10 text-destructive',
                  )}
                >
                  {row.status}
                </Badge>
              ),
            },
            {
              id: 'total',
              header: 'Total',
              cell: (row) => formatPrice(row.totalAmount) ?? row.totalAmount,
            },
            {
              id: 'created',
              header: 'Created',
              cell: (row) => formatDateTime(row.createdAt) ?? '—',
            },
          ]}
          rows={rows}
          getRowKey={(row) => row.id}
          pagination={{
            page,
            totalPage,
            total,
            onPageChange: (targetPage) => {
              void navigate({
                to: '/manage/deliveries',
                search: (prev) => ({
                  ...prev,
                  page: targetPage === 1 ? undefined : targetPage,
                }),
              })
            },
          }}
          actions={(row) => {
            const isRowPending =
              pendingOrderId === row.id &&
              (pendingStatus !== null || pendingCancel)

            return (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDetailOrderId(row.id)}
                >
                  Details
                </Button>
                <OrderStatusTransitionDropdown
                  currentStatus={row.status}
                  pendingStatus={
                    isRowPending && pendingStatus ? pendingStatus : null
                  }
                  pendingCancel={isRowPending && pendingCancel}
                  actor={ORDER_STATUS_ACTORS.DELIVERY_AGENT}
                  onAdvanceStatus={(nextStatus) =>
                    handleAdvanceStatus(row.id, nextStatus)
                  }
                  onCancelOrder={() => handleCancelOrder(row.id)}
                />
              </>
            )
          }}
        />
      </ManageAsyncState>

      <ManageOrderDetailDialog
        accessToken={accessToken}
        orderId={detailOrderId}
        open={detailOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailOrderId(null)
        }}
      />
    </div>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
