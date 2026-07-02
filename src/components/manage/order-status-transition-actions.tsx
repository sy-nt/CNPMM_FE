import type { ReactNode } from 'react'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import {
  getAllowedOrderStatusTransitions,
  getAllowedOrderStatusTransitionsForActor,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from '#/lib/api/order.constants'
import type { OrderStatus, OrderStatusActor } from '#/lib/api/order.constants'
import { ORDER_PERMISSIONS } from '#/lib/rbac/constants'

type OrderStatusTransitionActionsProps = {
  currentStatus: string
  pendingStatus: string | null
  pendingCancel: boolean
  onAdvanceStatus: (status: OrderStatus) => void
  onCancelOrder?: () => void
  actor?: OrderStatusActor
}

export function OrderStatusTransitionActions({
  currentStatus,
  pendingStatus,
  pendingCancel,
  onAdvanceStatus,
  onCancelOrder,
  actor,
}: OrderStatusTransitionActionsProps): ReactNode {
  const transitions = actor
    ? getAllowedOrderStatusTransitionsForActor(currentStatus, actor)
    : getAllowedOrderStatusTransitions(currentStatus)

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No further status changes.</p>
    )
  }

  const advanceTransitions = transitions.filter(
    (status) => status !== ORDER_STATUSES.CANCELLED,
  )
  const canCancel = transitions.includes(ORDER_STATUSES.CANCELLED)

  return (
    <div className="flex flex-wrap gap-2">
      <RequirePermission all={[ORDER_PERMISSIONS.ORDER_UPDATE_STATUS]}>
        {advanceTransitions.map((status) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant="outline"
            disabled={pendingStatus !== null || pendingCancel}
            onClick={() => onAdvanceStatus(status)}
          >
            {pendingStatus === status ? 'Updating…' : ORDER_STATUS_LABELS[status]}
          </Button>
        ))}
      </RequirePermission>

      {canCancel && onCancelOrder ? (
        <RequirePermission all={[ORDER_PERMISSIONS.ORDER_CANCEL]}>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pendingCancel || pendingStatus !== null}
            onClick={onCancelOrder}
          >
            {pendingCancel ? 'Cancelling…' : ORDER_STATUS_LABELS[ORDER_STATUSES.CANCELLED]}
          </Button>
        </RequirePermission>
      ) : null}
    </div>
  )
}
