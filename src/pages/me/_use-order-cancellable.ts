import { useEffect, useState } from 'react'

import {
  ORDER_STATUSES,
  getOrderCancelExpiresAtMs,
  isOrderCancellable,
} from '#/lib/api/order.constants'
import type { OrderSummary } from '#/lib/schemas/order.schema'

export function useOrderCancellable(
  order: Pick<OrderSummary, 'status' | 'createdAt'>,
): boolean {
  const [canCancel, setCanCancel] = useState(() => isOrderCancellable(order))

  useEffect(() => {
    if (order.status === ORDER_STATUSES.CANCELLED || !order.createdAt) {
      setCanCancel(false)
      return
    }

    const expiresAtMs = getOrderCancelExpiresAtMs(order.createdAt)
    if (expiresAtMs === null) {
      setCanCancel(false)
      return
    }

    const remainingMs = expiresAtMs - Date.now()
    if (remainingMs <= 0) {
      setCanCancel(false)
      return
    }

    setCanCancel(true)
    const timer = window.setTimeout(() => setCanCancel(false), remainingMs)
    return () => window.clearTimeout(timer)
  }, [order.status, order.createdAt])

  return canCancel
}
