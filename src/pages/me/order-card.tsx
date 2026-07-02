import { useState, type MouseEvent } from 'react'
import {
  ChevronDown,
  CreditCard,
  Loader2,
  MapPin,
  Package,
} from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import type { OrderStatus } from '#/lib/api/order.constants'
import {
  formatPaymentLabel,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
} from '#/lib/api/order.constants'
import { formatDateTime } from '#/lib/datetime'
import { formatPrice } from '#/lib/format'
import { resolveImageUrl } from '#/lib/images'
import type { OrderSummary } from '#/lib/schemas/order.schema'
import { useOrderCancel } from '#/pages/me/_use-order-cancel'
import { useOrderCancellable } from '#/pages/me/_use-order-cancellable'
import { cn } from '#/lib/utils'

type OrderCardProps = {
  accessToken: string
  order: OrderSummary
  onOrderChange: () => void | Promise<void>
}

export function OrderCard({
  accessToken,
  order,
  onOrderChange,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { pendingOrderId, cancelOrder } = useOrderCancel(
    accessToken,
    onOrderChange,
  )
  const firstItem = order.items.at(0)
  const extraItemCount = Math.max(order.items.length - 1, 0)
  const totalQuantity = _totalItemQuantity(order)
  const statusLabel = _orderStatusLabel(order.status)
  const placedAtLabel = formatDateTime(order.createdAt)
  const paymentLabel = _paymentLabel(order)
  const canCancel = useOrderCancellable(order)
  const isCancelling = pendingOrderId === order.id
  const formattedTotal = formatPrice(order.totalAmount) ?? '—'

  const handleToggle = (): void => {
    setIsExpanded((current) => !current)
  }

  const handleCancel = async (
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    event.stopPropagation()
    await cancelOrder(order.id)
  }

  return (
    <Card className="overflow-hidden transition-[box-shadow,border-color] duration-200 hover:border-primary/25 hover:shadow-lg">
      {isExpanded ? (
        <CardHeader className="gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </CardTitle>
            {placedAtLabel ? (
              <CardDescription>{placedAtLabel}</CardDescription>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                _statusTone(order.status),
              )}
            >
              {statusLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-muted-foreground"
              aria-expanded={isExpanded}
              onClick={handleToggle}
            >
              Hide details
              <ChevronDown
                aria-hidden="true"
                className="size-4 rotate-180 transition-transform"
              />
            </Button>
          </div>
        </CardHeader>
      ) : (
        <button
          type="button"
          className="w-full text-left"
          aria-expanded={isExpanded}
          onClick={handleToggle}
        >
          <CardHeader className="gap-4 p-0">
            <div className="bg-linear-to-br from-primary/8 via-card to-card px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  {placedAtLabel ? (
                    <p className="text-sm text-muted-foreground">
                      {placedAtLabel}
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    'inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                    _statusTone(order.status),
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-primary sm:text-3xl">
                    {formattedTotal}
                  </p>
                </div>
                <div className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-sm font-semibold text-foreground">
                  {totalQuantity}{' '}
                  {totalQuantity === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 pb-4">
              <ImageWithFallback
                src={resolveImageUrl(firstItem?.imageKeySnapshot ?? null)}
                alt=""
                className="size-16 shrink-0 rounded-lg border border-border"
                placeholder={<Package aria-hidden="true" className="size-7" />}
                fallback={<Package aria-hidden="true" className="size-7" />}
              />

              <div className="min-w-0 flex-1 space-y-1">
                {firstItem ? (
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {firstItem.nameSnapshot}
                    {extraItemCount > 0 ? (
                      <span className="text-muted-foreground">
                        {' '}
                        · +{extraItemCount} more
                      </span>
                    ) : null}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  View details
                  <ChevronDown aria-hidden="true" className="size-4" />
                </span>
              </div>
            </div>
          </CardHeader>
        </button>
      )}

      {canCancel ? (
        <div className="border-t border-border px-6 pb-4 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isCancelling}
            onClick={(event) => void handleCancel(event)}
          >
            {isCancelling ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Cancelling…
              </>
            ) : (
              'Cancel order'
            )}
          </Button>
        </div>
      ) : null}

      {isExpanded ? (
        <CardContent className="space-y-4 pt-4">
          <ul className="divide-y divide-border rounded-xl border border-border bg-muted/10">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-4 py-3"
              >
                <ImageWithFallback
                  src={resolveImageUrl(item.imageKeySnapshot)}
                  alt=""
                  className="size-14 shrink-0 rounded-md border border-border"
                  placeholder={
                    <Package aria-hidden="true" className="size-6" />
                  }
                  fallback={<Package aria-hidden="true" className="size-6" />}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {item.nameSnapshot}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                    {item.unitPriceSnapshot
                      ? ` · ${formatPrice(item.unitPriceSnapshot) ?? '—'} each`
                      : ''}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatPrice(item.subtotal) ??
                    (item.unitPriceSnapshot
                      ? formatPrice(
                          String(
                            Number(item.unitPriceSnapshot) * item.quantity,
                          ),
                        )
                      : null) ??
                    '—'}
                </p>
              </li>
            ))}
          </ul>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <CreditCard className="size-4" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Payment
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {paymentLabel ?? '—'}
                  </p>
                  {order.paymentStatus ? (
                    <p className="text-xs text-muted-foreground">
                      Status:{' '}
                      {formatPaymentLabel(
                        order.paymentStatus,
                        PAYMENT_STATUS_LABELS,
                      ) ?? order.paymentStatus}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {order.destinationAddressSnapshot ? (
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    <MapPin className="size-4" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Delivery address
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {order.destinationAddressSnapshot.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.destinationAddressSnapshot.addressLine}
                      <br />
                      {[
                        order.destinationAddressSnapshot.district,
                        order.destinationAddressSnapshot.city,
                        order.destinationAddressSnapshot.state,
                        order.destinationAddressSnapshot.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}

function _totalItemQuantity(order: OrderSummary): number {
  return order.items.reduce((total, item) => total + item.quantity, 0)
}

function _paymentLabel(order: OrderSummary): string | null {
  return (
    formatPaymentLabel(order.paymentMethod) ??
    formatPaymentLabel(order.paymentStatus, PAYMENT_STATUS_LABELS)
  )
}

function _orderStatusLabel(status: string): string {
  if (_isOrderStatus(status)) {
    return ORDER_STATUS_LABELS[status]
  }
  return status
}

function _isOrderStatus(status: string): status is OrderStatus {
  return status in ORDER_STATUS_LABELS
}

function _statusTone(status: string): string {
  if (_isOrderStatus(status)) {
    return ORDER_STATUS_TONES[status]
  }
  return 'bg-muted text-muted-foreground'
}
