import { Loader2, ShoppingBag, Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatPrice } from '#/lib/format'

type CartSummaryProps = {
  itemCount: number
  subtotal: number | null
  /** Subtotal reported by the server, takes priority when present. */
  serverSubtotal: string | null
  isClearing: boolean
  onClear: () => void
}

export function CartSummary({
  itemCount,
  subtotal,
  serverSubtotal,
  isClearing,
  onClear,
}: CartSummaryProps) {
  const displaySubtotal =
    formatPrice(serverSubtotal) ??
    (subtotal !== null ? formatPrice(String(subtotal)) : null)

  return (
    <Card className="sticky top-20 self-start">
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
        <CardDescription>
          {itemCount === 0
            ? 'Your cart is empty.'
            : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Subtotal
          </span>
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {displaySubtotal ?? '—'}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Shipping and taxes are calculated at checkout.
        </p>

        <div className="flex flex-col gap-2">
          <Button type="button" size="lg" disabled={itemCount === 0}>
            <ShoppingBag aria-hidden="true" />
            Checkout
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onClear}
            disabled={isClearing || itemCount === 0}
          >
            {isClearing ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            {isClearing ? 'Clearing…' : 'Clear cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
