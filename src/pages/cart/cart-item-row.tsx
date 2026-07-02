import { Link } from '@tanstack/react-router'
import { Loader2, Package, Trash2 } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { Button } from '#/components/ui/button'
import { formatPrice } from '#/lib/format'
import { resolveImageUrl } from '#/lib/images'
import { cn } from '#/lib/utils'
import type { CartLineView } from '#/pages/cart/_cart-line'
import { QUANTITY_MIN, QuantityStepper } from '#/pages/product/quantity-stepper'

/**
 * Hard ceiling for SKUs whose enrichment didn't ship a stock value. Real
 * stock from `sku.quantity` always wins when present.
 */
const QUANTITY_FALLBACK_MAX = 99

type CartItemRowProps = {
  line: CartLineView
  selected: boolean
  onSelectedChange: (skuId: string, selected: boolean) => void
  isUpdating: boolean
  isRemoving: boolean
  onQuantityChange: (skuId: string, nextQuantity: number) => void
  onRemove: (skuId: string) => void
  embedded?: boolean
}

export function CartItemRow({
  line,
  selected,
  onSelectedChange,
  isUpdating,
  isRemoving,
  onQuantityChange,
  onRemove,
  embedded = false,
}: CartItemRowProps) {
  const imageUrl = resolveImageUrl(line.imageKey)
  const formattedUnit = formatPrice(line.unitPrice)
  const formattedLine =
    line.lineTotal !== null
      ? formatPrice(String(line.lineTotal))
      : formattedUnit
  const maxQuantity = line.availableStock ?? QUANTITY_FALLBACK_MAX
  const stepperDisabled = isUpdating || isRemoving || line.isInactive
  const checkboxDisabled = isUpdating || isRemoving || line.isInactive

  const nameNode = line.productSlug ? (
    <Link
      to="/product/$slug"
      params={{ slug: line.productSlug }}
      className="text-sm font-semibold leading-snug text-foreground no-underline hover:underline"
    >
      {line.name}
    </Link>
  ) : (
    <span className="text-sm font-semibold leading-snug text-foreground">
      {line.name}
    </span>
  )

  return (
    <li
      className={cn(
        'flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch',
        embedded
          ? 'border-b border-border last:border-b-0'
          : 'rounded-xl border border-border bg-card',
      )}
    >
      <label className="mt-1 flex items-start gap-2 sm:mt-0 sm:items-center">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-border text-primary accent-primary sm:mt-0"
          checked={selected}
          disabled={checkboxDisabled}
          onChange={(event) =>
            onSelectedChange(line.skuId, event.target.checked)
          }
          aria-label={`Select ${line.name}`}
        />
      </label>
      <ImageWithFallback
        src={imageUrl}
        alt=""
        className="aspect-square w-full max-w-32 shrink-0 rounded-lg sm:size-24"
        placeholder={
          <Package
            aria-hidden="true"
            className="size-8 text-muted-foreground"
          />
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            {nameNode}
            {line.variantSummary ? (
              <p className="text-xs text-muted-foreground">
                {line.variantSummary}
              </p>
            ) : null}
            {line.isInactive ? (
              <p className="text-xs font-medium text-destructive">
                Currently unavailable
              </p>
            ) : null}
            {formattedUnit ? (
              <p className="text-xs text-muted-foreground">
                {formattedUnit} each
              </p>
            ) : null}
          </div>

          {formattedLine ? (
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formattedLine}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <QuantityStepper
              value={line.quantity}
              max={Math.max(QUANTITY_MIN, maxQuantity)}
              onChange={(next) => onQuantityChange(line.skuId, next)}
              disabled={stepperDisabled}
            />
            {isUpdating ? (
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin text-muted-foreground"
              />
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onRemove(line.skuId)}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            {isRemoving ? 'Removing…' : 'Remove'}
          </Button>
        </div>
      </div>
    </li>
  )
}
