import { Link } from '@tanstack/react-router'
import { Loader2, ShoppingBag } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatPrice } from '#/lib/format'

type CheckoutSummaryProps = {
  itemCount: number
  grandTotal: string | null
  canPlaceOrder: boolean
  isPreviewLoading: boolean
  isPlacing: boolean
  previewError: string | null
  onPlaceOrder: () => void
}

export function CheckoutSummary({
  itemCount,
  grandTotal,
  canPlaceOrder,
  isPreviewLoading,
  isPlacing,
  previewError,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  return (
    <Card className="sticky top-20 self-start">
      <CardHeader>
        <CardTitle>Order total</CardTitle>
        <CardDescription>
          {itemCount === 0
            ? 'Your cart is empty.'
            : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Total
          </span>
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {isPreviewLoading
              ? 'Calculating…'
              : (formatPrice(grandTotal) ?? '—')}
          </span>
        </div>

        {previewError ? (
          <p className="text-sm text-destructive" role="alert">
            {previewError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Totals include shipping and any eligible discounts.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            disabled={!canPlaceOrder || isPlacing || isPreviewLoading}
            onClick={onPlaceOrder}
          >
            {isPlacing ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <ShoppingBag aria-hidden="true" />
            )}
            {isPlacing ? 'Placing order…' : 'Place order'}
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/cart">Back to cart</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
