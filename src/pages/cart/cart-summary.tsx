import { Link } from '@tanstack/react-router'
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
import {
  buildCheckoutItemsFromLines,
  encodeCheckoutSelection,
} from '#/pages/checkout/_checkout-selection'
import type { CartLineView } from '#/pages/cart/_cart-line'

type CartSummaryProps = {
  itemCount: number
  subtotal: number | null
  /** Subtotal reported by the server, takes priority when present. */
  serverSubtotal: string | null
  selectedCount: number
  selectedLines: ReadonlyArray<CartLineView>
  isClearing: boolean
  onClear: () => void
}

export function CartSummary({
  itemCount,
  subtotal,
  serverSubtotal,
  selectedCount,
  selectedLines,
  isClearing,
  onClear,
}: CartSummaryProps) {
  const checkoutSelection = encodeCheckoutSelection(
    buildCheckoutItemsFromLines(selectedLines),
  )
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
            Selected
          </span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {selectedCount}
          </span>
        </div>
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
          <Button type="button" size="lg" disabled={selectedCount === 0} asChild>
            <Link to="/checkout" search={{ selection: checkoutSelection }}>
              <ShoppingBag aria-hidden="true" />
              Checkout
            </Link>
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
