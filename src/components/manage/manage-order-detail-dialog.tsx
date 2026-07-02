import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, Loader2, MapPin, Package } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { Badge } from '#/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { ScrollArea } from '#/components/ui/scroll-area'
import {
  formatPaymentLabel,
  isOrderStatus,
  ORDER_FULFILLMENT_STEPS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  ORDER_STATUSES,
  PAYMENT_STATUS_LABELS,
} from '#/lib/api/order.constants'
import { formatDateTime } from '#/lib/datetime'
import { formatPrice } from '#/lib/format'
import { resolveImageUrl } from '#/lib/images'
import { orderDetailQueryOptions } from '#/lib/query/order'
import type { OrderSummary } from '#/lib/schemas/order.schema'
import { cn } from '#/lib/utils'

type ManageOrderDetailDialogProps = {
  accessToken: string
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  footerActions?: (order: OrderSummary) => ReactNode
}

export function ManageOrderDetailDialog({
  accessToken,
  orderId,
  open,
  onOpenChange,
  footerActions,
}: ManageOrderDetailDialogProps): ReactNode {
  const orderQuery = useQuery({
    ...orderDetailQueryOptions(accessToken, orderId ?? ''),
    enabled: open && Boolean(orderId),
  })

  const order = orderQuery.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="border-b bg-linear-to-br from-[var(--surface-strong)] to-[var(--surface)] px-6 py-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-lg">
              {order
                ? `Order #${order.id.slice(0, 8).toUpperCase()}`
                : 'Order details'}
            </DialogTitle>
            <DialogDescription>
              Fulfillment progress, line items, and delivery information.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[min(70vh,640px)]">
          <div className="space-y-5 px-6 py-5">
            {orderQuery.isLoading ? (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Loading order…
              </p>
            ) : orderQuery.isError || !order ? (
              <p className="text-sm text-destructive">
                Could not load order details.
              </p>
            ) : (
              <>
                <OrderStatusTimeline status={order.status} />
                <OrderSummaryMeta order={order} />
                <OrderLineItems order={order} />
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          {order && footerActions ? footerActions(order) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrderStatusTimeline({ status }: { status: string }): ReactNode {
  const isCancelled = status === ORDER_STATUSES.CANCELLED
  const currentIndex = ORDER_FULFILLMENT_STEPS.findIndex((step) => step === status)

  return (
    <section className="rounded-xl border border-border/70 bg-card/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Fulfillment progress
      </h3>
      {isCancelled ? (
        <Badge variant="destructive">Cancelled</Badge>
      ) : (
        <ol className="space-y-2">
          {ORDER_FULFILLMENT_STEPS.map((step, index) => {
            const isComplete = currentIndex > index
            const isCurrent = currentIndex === index
            const label = ORDER_STATUS_LABELS[step]

            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      'border-primary bg-primary/10 text-primary ring-2 ring-primary/20',
                    !isComplete &&
                      !isCurrent &&
                      'border-border bg-muted text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {isComplete ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    isCurrent
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function OrderSummaryMeta({ order }: { order: OrderSummary }): ReactNode {
  const statusLabel = isOrderStatus(order.status)
    ? ORDER_STATUS_LABELS[order.status]
    : order.status
  const statusTone = isOrderStatus(order.status)
    ? ORDER_STATUS_TONES[order.status]
    : 'bg-muted text-muted-foreground'
  const paymentLabel = formatPaymentLabel(order.paymentMethod)
  const paymentStatusLabel = order.paymentStatus
    ? (PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus)
    : null
  const address = order.destinationAddressSnapshot

  return (
    <section className="rounded-xl border border-border/70 bg-card/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Overview</h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </dt>
          <dd>
            <Badge variant="outline" className={cn('border-transparent', statusTone)}>
              {statusLabel}
            </Badge>
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Placed
          </dt>
          <dd className="text-sm text-foreground">
            {formatDateTime(order.createdAt) ?? '—'}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Items subtotal
          </dt>
          <dd className="text-sm text-foreground">
            {formatPrice(order.itemsSubtotal) ?? order.itemsSubtotal}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Delivery fee
          </dt>
          <dd className="text-sm text-foreground">
            {formatPrice(order.deliveryFee) ?? order.deliveryFee}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total
          </dt>
          <dd className="text-sm font-medium text-foreground">
            {formatPrice(order.totalAmount) ?? order.totalAmount}
          </dd>
        </div>
        {paymentLabel ? (
          <div className="space-y-1">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Payment
            </dt>
            <dd className="text-sm text-foreground">
              {paymentLabel}
              {paymentStatusLabel ? ` · ${paymentStatusLabel}` : ''}
            </dd>
          </div>
        ) : null}
      </dl>

      {address ? (
        <div className="mt-4 space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5" />
            Delivery address
          </p>
          <p className="text-sm font-medium text-foreground">{address.name}</p>
          <p className="text-sm text-muted-foreground">
            {[
              address.addressLine,
              address.district,
              address.city,
              address.state,
              address.country,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      ) : null}
    </section>
  )
}

function OrderLineItems({ order }: { order: OrderSummary }): ReactNode {
  return (
    <section className="rounded-xl border border-border/70 bg-card/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Line items</h3>
      {order.items.length === 0 ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Package aria-hidden="true" className="size-4" />
          No item details available.
        </p>
      ) : (
        <ul className="space-y-2">
          {order.items.map((item) => {
            const imageUrl = resolveImageUrl(item.imageKeySnapshot)
            const unitPrice =
              formatPrice(item.unitPriceSnapshot) ?? item.unitPriceSnapshot
            const subtotal = formatPrice(item.subtotal) ?? item.subtotal

            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2"
              >
                <ImageWithFallback
                  src={imageUrl}
                  alt=""
                  className="size-12 shrink-0 rounded-md border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.nameSnapshot}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {unitPrice ? `${unitPrice} each` : null}
                    {unitPrice && subtotal ? ' · ' : null}
                    {subtotal ? `Subtotal ${subtotal}` : null}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  x{item.quantity}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}