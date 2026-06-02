import type {
  ProductAttribute,
  ProductSku,
} from '#/lib/schemas/product.schema'
import { AttributePicker } from '#/pages/product/attribute-picker'
import type { AttributeSelection } from '#/pages/product/_sku-selection'

type ProductAttributesProps = {
  attributes: ReadonlyArray<ProductAttribute>
  skus: ReadonlyArray<ProductSku>
  selection: AttributeSelection
  matchedSku: ProductSku | undefined
  onSelect: (attributeId: string, valueId: string) => void
}

export function ProductAttributes({
  attributes,
  skus,
  selection,
  matchedSku,
  onSelect,
}: ProductAttributesProps) {
  if (attributes.length === 0) return null

  const skuRequired = skus.length > 0
  const allAttributesPicked = attributes.every((attr) => selection[attr.id])

  return (
    <section className="space-y-4">
      {attributes.map((attribute) => (
        <AttributePicker
          key={attribute.id}
          attribute={attribute}
          selectedValueId={selection[attribute.id]}
          skus={skus}
          selection={selection}
          onSelect={(valueId) => onSelect(attribute.id, valueId)}
        />
      ))}
      {skuRequired && !allAttributesPicked ? (
        <p className="text-sm text-muted-foreground">
          Choose every option to see availability.
        </p>
      ) : null}
      {skuRequired && allAttributesPicked && !matchedSku ? (
        <p className="text-sm font-medium text-destructive">
          This combination is unavailable. Try a different mix.
        </p>
      ) : null}
    </section>
  )
}
