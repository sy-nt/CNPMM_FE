import type { ReactNode } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  getAllowedOrderStatusTransitions,
  getAllowedOrderStatusTransitionsForActor,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from '#/lib/api/order.constants'
import type { OrderStatus, OrderStatusActor } from '#/lib/api/order.constants'
import { ORDER_PERMISSIONS } from '#/lib/rbac/constants'
import { cn } from '#/lib/utils'

type OrderStatusTransitionDropdownProps = {
  currentStatus: string
  pendingStatus: string | null
  pendingCancel: boolean
  onAdvanceStatus: (status: OrderStatus) => void
  onCancelOrder?: () => void
  actor?: OrderStatusActor
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
}

export function OrderStatusTransitionDropdown({
  currentStatus,
  pendingStatus,
  pendingCancel,
  onAdvanceStatus,
  onCancelOrder,
  actor,
  disabled = false,
  align = 'end',
}: OrderStatusTransitionDropdownProps): ReactNode {
  const transitions = actor
    ? getAllowedOrderStatusTransitionsForActor(currentStatus, actor)
    : getAllowedOrderStatusTransitions(currentStatus)

  const isPending = pendingStatus !== null || pendingCancel
  const advanceTransitions = transitions.filter(
    (status) => status !== ORDER_STATUSES.CANCELLED,
  )
  const canCancel = transitions.includes(ORDER_STATUSES.CANCELLED)

  if (transitions.length === 0) {
    return (
      <Button type="button" size="sm" variant="outline" disabled>
        No updates
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || isPending}
        >
          {isPending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              Update status
              <ChevronDown aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <RequirePermission all={[ORDER_PERMISSIONS.ORDER_UPDATE_STATUS]}>
          {advanceTransitions.map((status) => (
            <DropdownMenuItem
              key={status}
              disabled={isPending}
              onClick={() => onAdvanceStatus(status)}
            >
              {ORDER_STATUS_LABELS[status]}
            </DropdownMenuItem>
          ))}
        </RequirePermission>

        {canCancel && onCancelOrder ? (
          <RequirePermission all={[ORDER_PERMISSIONS.ORDER_CANCEL]}>
            {advanceTransitions.length > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              className={cn(
                'font-medium text-destructive',
                'focus:bg-destructive/10 focus:text-destructive',
              )}
              onClick={onCancelOrder}
            >
              {ORDER_STATUS_LABELS[ORDER_STATUSES.CANCELLED]}
            </DropdownMenuItem>
          </RequirePermission>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
