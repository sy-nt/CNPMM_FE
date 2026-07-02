import { PAGINATION_DEFAULTS } from '#/lib/api/common'
import type { OrderListQuery } from '#/lib/api/order'
import { getExpiresAtMs, isWithinDurationMs } from '#/lib/datetime'
import type { OrderSummary } from '#/lib/schemas/order.schema'

const MINUTE_MS = 60_000

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]

export const ORDER_STATUS_ALL = 'all' as const

export type OrderStatusTab = OrderStatus | typeof ORDER_STATUS_ALL

export const ORDER_STATUS_TABS: ReadonlyArray<{
  value: OrderStatusTab
  label: string
}> = [
  { value: ORDER_STATUS_ALL, label: 'All' },
  { value: ORDER_STATUSES.PENDING, label: 'Pending' },
  { value: ORDER_STATUSES.CONFIRMED, label: 'Confirmed' },
  { value: ORDER_STATUSES.PROCESSING, label: 'Processing' },
  { value: ORDER_STATUSES.SHIPPED, label: 'Shipped' },
  { value: ORDER_STATUSES.DELIVERED, label: 'Delivered' },
  { value: ORDER_STATUSES.COMPLETED, label: 'Completed' },
  { value: ORDER_STATUSES.CANCELLED, label: 'Cancelled' },
] as const

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.SHIPPED]: 'Shipped',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.COMPLETED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
}

export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  [ORDER_STATUSES.CANCELLED]: [],
  [ORDER_STATUSES.COMPLETED]: [],
  [ORDER_STATUSES.CONFIRMED]: [
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.CANCELLED,
  ],
  [ORDER_STATUSES.DELIVERED]: [ORDER_STATUSES.COMPLETED],
  [ORDER_STATUSES.PENDING]: [
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.CANCELLED,
  ],
  [ORDER_STATUSES.PROCESSING]: [
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.CANCELLED,
  ],
  [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
}

export function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS_TRANSITIONS
}

export function getAllowedOrderStatusTransitions(
  currentStatus: string,
): ReadonlyArray<OrderStatus> {
  if (!isOrderStatus(currentStatus)) return []
  return ORDER_STATUS_TRANSITIONS[currentStatus]
}

export const ORDER_STATUS_ACTORS = {
  SHOP: 'shop',
  DELIVERY_AGENT: 'delivery_agent',
} as const

export type OrderStatusActor =
  (typeof ORDER_STATUS_ACTORS)[keyof typeof ORDER_STATUS_ACTORS]

export const SHOP_SETTABLE_ORDER_STATUSES = [
  ORDER_STATUSES.CONFIRMED,
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.COMPLETED,
  ORDER_STATUSES.CANCELLED,
] as const satisfies ReadonlyArray<OrderStatus>

export const DELIVERY_AGENT_SETTABLE_ORDER_STATUSES = [
  ORDER_STATUSES.SHIPPED,
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.CANCELLED,
] as const satisfies ReadonlyArray<OrderStatus>

const _SETTABLE_STATUSES_BY_ACTOR: Record<
  OrderStatusActor,
  ReadonlySet<OrderStatus>
> = {
  [ORDER_STATUS_ACTORS.SHOP]: new Set(SHOP_SETTABLE_ORDER_STATUSES),
  [ORDER_STATUS_ACTORS.DELIVERY_AGENT]: new Set(
    DELIVERY_AGENT_SETTABLE_ORDER_STATUSES,
  ),
}

export function getAllowedOrderStatusTransitionsForActor(
  currentStatus: string,
  actor: OrderStatusActor,
): ReadonlyArray<OrderStatus> {
  const workflowTransitions = getAllowedOrderStatusTransitions(currentStatus)
  const settableStatuses = _SETTABLE_STATUSES_BY_ACTOR[actor]
  return workflowTransitions.filter((status) => settableStatuses.has(status))
}

export function canTransitionOrderStatusForActor(
  currentStatus: string,
  nextStatus: OrderStatus,
  actor: OrderStatusActor,
): boolean {
  return getAllowedOrderStatusTransitionsForActor(currentStatus, actor).includes(
    nextStatus,
  )
}

export function canTransitionOrderStatus(
  currentStatus: string,
  nextStatus: OrderStatus,
): boolean {
  return getAllowedOrderStatusTransitions(currentStatus).includes(nextStatus)
}

export const ORDER_FULFILLMENT_STEPS = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.CONFIRMED,
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.SHIPPED,
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.COMPLETED,
] as const satisfies ReadonlyArray<OrderStatus>

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'bg-chart-4/20 text-chart-4',
  [ORDER_STATUSES.CONFIRMED]: 'bg-chart-2/20 text-chart-2',
  [ORDER_STATUSES.PROCESSING]: 'bg-chart-5/20 text-chart-5',
  [ORDER_STATUSES.SHIPPED]: 'bg-chart-1/20 text-chart-1',
  [ORDER_STATUSES.DELIVERED]: 'bg-chart-3/20 text-chart-3',
  [ORDER_STATUSES.COMPLETED]: 'bg-primary/10 text-primary',
  [ORDER_STATUSES.CANCELLED]: 'bg-destructive/10 text-destructive',
}

export const ORDER_CANCEL_WINDOW_MS = 30 * MINUTE_MS

export const ORDER_CANCEL_REASON = 'Customer requested cancellation'

export function isOrderWithinCancelWindow(
  createdAt: string,
  nowMs: number = Date.now(),
): boolean {
  return isWithinDurationMs(createdAt, ORDER_CANCEL_WINDOW_MS, nowMs)
}

export function getOrderCancelExpiresAtMs(createdAt: string): number | null {
  return getExpiresAtMs(createdAt, ORDER_CANCEL_WINDOW_MS)
}

export function isOrderCancellable(
  order: Pick<OrderSummary, 'status' | 'createdAt'>,
): boolean {
  if (order.status === ORDER_STATUSES.CANCELLED) return false
  if (!order.createdAt) return false
  return isOrderWithinCancelWindow(order.createdAt)
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Cash on delivery',
  cash_on_delivery: 'Cash on delivery',
  card: 'Credit / debit card',
  bank_transfer: 'Bank transfer',
  e_wallet: 'E-wallet',
}

export function formatPaymentLabel(
  value: string | null | undefined,
  labels: Record<string, string> = PAYMENT_METHOD_LABELS,
): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (labels[normalized]) return labels[normalized]
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const ORDER_LIST_DEFAULT_QUERY: OrderListQuery = {
  page: PAGINATION_DEFAULTS.PAGE,
  limit: PAGINATION_DEFAULTS.LIMIT,
  sort: PAGINATION_DEFAULTS.SORT,
  orderBy: 'createdAt',
}
