import type { ProductDetail, ProductSku } from '#/lib/schemas/product.schema'

export type AttributeSelection = Record<string, string>

export function initialSelection(product: ProductDetail): AttributeSelection {
  if (product.skus.length === 0) return {}
  const onlySku = product.skus.length === 1 ? product.skus[0] : undefined
  if (!onlySku) return {}
  return selectionFromSku(onlySku)
}

export function selectionFromSku(sku: ProductSku): AttributeSelection {
  const next: AttributeSelection = {}
  for (const sel of sku.selections) {
    next[sel.attributeId] = sel.attributeValueId
  }
  return next
}

export function matchSkuFromSelection(
  skus: ReadonlyArray<ProductSku>,
  selection: AttributeSelection,
): ProductSku | undefined {
  if (skus.length === 0) return undefined
  return skus.find((sku) => _skuMatchesSelection(sku, selection))
}

function _skuMatchesSelection(
  sku: ProductSku,
  selection: AttributeSelection,
): boolean {
  if (sku.selections.length === 0) return false
  return sku.selections.every(
    (sel) => selection[sel.attributeId] === sel.attributeValueId,
  )
}
