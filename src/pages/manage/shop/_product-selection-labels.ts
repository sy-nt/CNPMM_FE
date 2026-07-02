import type {
  ProductAttribute,
  ProductSku,
  ProductSkuSelection,
} from '#/lib/schemas/product.schema'

export function formatSkuSelectionSummary(
  selections: ReadonlyArray<ProductSkuSelection>,
  attributes: ReadonlyArray<ProductAttribute>,
): string {
  if (selections.length === 0) return 'No variant mapping'

  return selections
    .map((selection) => {
      const attribute = attributes.find(
        (entry) => entry.id === selection.attributeId,
      )
      const value = attribute?.values.find(
        (entry) => entry.id === selection.attributeValueId,
      )
      if (attribute && value) return `${attribute.name}: ${value.value}`
      return `${selection.attributeId.slice(0, 8)}…`
    })
    .join(' · ')
}

export function summariseSku(productSku: ProductSku): string {
  const parts = [productSku.skuCode]
  if (productSku.name) parts.push(productSku.name)
  return parts.join(' — ')
}
