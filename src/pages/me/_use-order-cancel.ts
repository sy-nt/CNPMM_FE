import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '#/lib/api/client'
import { ORDER_CANCEL_REASON } from '#/lib/api/order.constants'
import { orderMutations } from '#/lib/query/order'

type UseOrderCancelResult = {
  pendingOrderId: string | null
  cancelOrder: (orderId: string) => Promise<void>
}

export function useOrderCancel(
  accessToken: string,
  onSuccess: () => void | Promise<void>,
): UseOrderCancelResult {
  const queryClient = useQueryClient()
  const cancelMutation = useMutation(
    orderMutations(accessToken, queryClient).cancel,
  )

  const cancelOrder = async (orderId: string): Promise<void> => {
    if (cancelMutation.isPending) return

    try {
      await cancelMutation.mutateAsync({
        orderId,
        reason: ORDER_CANCEL_REASON,
        idempotencyKey: crypto.randomUUID(),
      })
      toast.success('Order cancelled.')
      await onSuccess()
    } catch (error) {
      toast.error(_humaniseError(error, 'Could not cancel the order.'))
    }
  }

  return {
    pendingOrderId: cancelMutation.isPending
      ? (cancelMutation.variables?.orderId ?? null)
      : null,
    cancelOrder,
  }
}

function _humaniseError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'You cannot cancel this order.'
    if (error.status === 404) return 'Order not found.'
    if (error.status === 409) return 'This order can no longer be cancelled.'
  }
  return fallback
}
