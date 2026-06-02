import { QuantityStepper } from '#/pages/product/quantity-stepper'
import { StockIndicator } from '#/pages/product/stock-indicator'
import type { StockInfo } from '#/pages/product/stock-indicator'

type ProductQuantitySectionProps = {
  quantity: number
  maxQuantity: number
  stockInfo: StockInfo
  disabled: boolean
  onChange: (next: number) => void
}

export function ProductQuantitySection({
  quantity,
  maxQuantity,
  stockInfo,
  disabled,
  onChange,
}: ProductQuantitySectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quantity
        </h2>
        <StockIndicator info={stockInfo} />
      </div>
      <QuantityStepper
        value={quantity}
        max={maxQuantity}
        onChange={onChange}
        disabled={disabled}
      />
    </section>
  )
}
