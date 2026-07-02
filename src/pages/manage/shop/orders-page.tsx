import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ManageActionDialog } from '#/components/manage/manage-action-dialog'
import { ManageDataTable } from '#/components/manage/manage-data-table'
import { ManageOrderDetailDialog } from '#/components/manage/manage-order-detail-dialog'
import { OrderStatusTransitionActions } from '#/components/manage/order-status-transition-actions'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import {
  ORDER_CANCEL_REASON,
  ORDER_STATUS_ACTORS,
} from '#/lib/api/order.constants'
import type { OrderStatus } from '#/lib/api/order.constants'
import { cancelOrder, updateOrderStatus } from '#/lib/api/order'
import { formatDateTime } from '#/lib/datetime'
import { formatPrice } from '#/lib/format'
import type { OrderSummary } from '#/lib/schemas/order.schema'
import { orderKeys } from '#/lib/query/keys'
import { orderListQueryOptions } from '#/lib/query/order'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'
import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'

const ORDER_LIST_BASE_QUERY = {
  limit: MANAGE_TABLE_PAGE_SIZE,
  sort: 'desc' as const,
}

export function ShopOrdersPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [activeOrder, setActiveOrder] = useState<OrderSummary | null>(null)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const { page, setPage } = useManageTablePage()

  const ordersQuery = useQuery(
    orderListQueryOptions(accessToken, { ...ORDER_LIST_BASE_QUERY, page }),
  )

  const updateStatusMutation = useMutation({
    mutationFn: (input: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(accessToken, input.orderId, { status: input.status }),
    onSuccess: async () => {
      toast.success('Order status updated.')
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
      setActiveOrder(null)
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not update order status.'))
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
      setActiveOrder(null)
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not cancel order.'))
    },
  })

  const rows = ordersQuery.data?.items ?? []
  const totalPage = ordersQuery.data?.totalPage ?? 1

  const pendingStatus =
    updateStatusMutation.isPending && updateStatusMutation.variables
      ? updateStatusMutation.variables.status
      : null
  const pendingCancel =
    cancelMutation.isPending &&
    cancelMutation.variables === activeOrder?.id

  return (
    <ManageSection
      title="Shop orders"
      description="Track order progress and advance statuses along the fulfillment flow."
    >
      <ManageAsyncState
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
        isEmpty={rows.length === 0}
        emptyTitle="No orders found"
        emptyDescription="Incoming shop orders will appear here."
      >
        <ManageDataTable<OrderSummary>
          columns={[
            {
              id: 'id',
              header: 'Order',
              cell: (row) => (
                <span className="font-mono text-xs">{row.id.slice(0, 8)}…</span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              cell: (row) => <Badge variant="outline">{row.status}</Badge>,
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
          pagination={{ page, totalPage, onPageChange: setPage }}
          actions={(row) => (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetailOrderId(row.id)}
              >
                Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveOrder(row)}
              >
                Actions
              </Button>
            </>
          )}
        />
      </ManageAsyncState>

      <ManageActionDialog
        open={activeOrder !== null}
        onOpenChange={(open) => {
          if (!open) setActiveOrder(null)
        }}
        title="Order actions"
        description={
          activeOrder ? `Manage order ${activeOrder.id.slice(0, 8)}…` : undefined
        }
        hideConfirm
        cancelLabel="Close"
      >
        {activeOrder ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-sm">
              <p className="font-medium text-foreground">
                Current status: {activeOrder.status}
              </p>
              <p className="text-muted-foreground">
                Total: {formatPrice(activeOrder.totalAmount) ?? activeOrder.totalAmount}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Allowed transitions</Label>
              <OrderStatusTransitionActions
                currentStatus={activeOrder.status}
                pendingStatus={pendingStatus}
                pendingCancel={pendingCancel}
                actor={ORDER_STATUS_ACTORS.SHOP}
                onAdvanceStatus={(status) =>
                  updateStatusMutation.mutate({
                    orderId: activeOrder.id,
                    status,
                  })
                }
                onCancelOrder={() => cancelMutation.mutate(activeOrder.id)}
              />
            </div>
          </div>
        ) : null}
      </ManageActionDialog>

      <ManageOrderDetailDialog
        accessToken={accessToken}
        orderId={detailOrderId}
        open={detailOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailOrderId(null)
        }}
      />
    </ManageSection>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
