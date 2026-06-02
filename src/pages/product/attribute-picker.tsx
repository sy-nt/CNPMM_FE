import type {
  ProductAttribute,
  ProductSku,
} from '#/lib/schemas/product.schema'
import { cn } from '#/lib/utils'
import type { AttributeSelection } from '#/pages/product/_sku-selection'

type AttributePickerProps = {
  attribute: ProductAttribute
  selectedValueId: string | undefined
  skus: ReadonlyArray<ProductSku>
  selection: AttributeSelection
  onSelect: (valueId: string) => void
}

export function AttributePicker({
  attribute,
  selectedValueId,
  skus,
  selection,
  onSelect,
}: AttributePickerProps) {
  const selectedValue = attribute.values.find(
    (value) => value.id === selectedValueId,
  )

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {attribute.name}
        </h3>
        {selectedValue ? (
          <span className="text-sm text-foreground">{selectedValue.value}</span>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label={attribute.name}
        className="flex flex-wrap gap-2"
      >
        {[...attribute.values]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((value) => {
            const isSelected = value.id === selectedValueId
            const isAvailable =
              skus.length === 0 ||
              _isAttributeValueReachable(
                skus,
                attribute.id,
                value.id,
                selection,
              )
            return (
              <button
                key={value.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!isAvailable}
                onClick={() => onSelect(value.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-foreground/40',
                  !isAvailable && 'opacity-50 line-through hover:border-border',
                )}
              >
                {value.value}
              </button>
            )
          })}
      </div>
    </div>
  )
}

/**
 * Disables an attribute value when no SKU exists that pairs the candidate
 * with the user's *other* current picks. Mirrors the standard variant-grid UX
 * — never gray out the value the user already chose for the active group.
 */
function _isAttributeValueReachable(
  skus: ReadonlyArray<ProductSku>,
  attributeId: string,
  valueId: string,
  selection: AttributeSelection,
): boolean {
  return skus.some((sku) => {
    const value = sku.selections.find((s) => s.attributeId === attributeId)
    if (!value || value.attributeValueId !== valueId) return false
    return sku.selections.every((sel) => {
      if (sel.attributeId === attributeId) return true
      const picked = selection[sel.attributeId]
      return !picked || picked === sel.attributeValueId
    })
  })
}
