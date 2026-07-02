import type { CartItem } from '#/lib/schemas/cart.schema'

export type CartLineView = {
  key: string
  skuId: string
  shopId: string | null
  shopName: string | null
  quantity: number
  unitPrice: string | null
  lineTotal: number | null
  name: string
  variantSummary: string | null
  imageKey: string | null
  productSlug: string | null
  availableStock: number | null
  isInactive: boolean
}

const FALLBACK_NAME = 'Cart item'

export function buildCartLineView(item: CartItem): CartLineView {
  const sku = item.sku ?? null
  const product = item.product ?? null

  const unitPrice = item.price ?? sku?.price ?? product?.price ?? null
  const numericUnit = unitPrice !== null ? Number(unitPrice) : NaN
  const lineTotal =
    item.subtotal !== null && item.subtotal !== undefined
      ? _parseNumber(item.subtotal)
      : Number.isFinite(numericUnit)
        ? numericUnit * item.quantity
        : null

  const name =
    _pickName(sku?.name, product?.name) ??
    sku?.skuCode ??
    (item.skuId.length > 0 ? item.skuId : FALLBACK_NAME)

  const variantSummary = _summariseSelections(sku?.selections ?? [])

  const shopId = item.shopId ?? sku?.shop?.id ?? product?.shopId ?? null
  const shopName = _pickName(item.shopName, sku?.shop?.name)

  return {
    key: item.id ?? item.skuId,
    skuId: item.skuId,
    shopId,
    shopName,
    quantity: item.quantity,
    unitPrice,
    lineTotal,
    name,
    variantSummary,
    imageKey: sku?.imageKey ?? product?.mainImageKey ?? null,
    productSlug: product?.slug ?? null,
    availableStock: _resolveAvailableStock(sku),
    isInactive:
      item.isAvailable === false ||
      sku?.isActive === false ||
      product?.isActive === false,
  }
}

export function cartLineSubtotal(line: CartLineView): number {
  return line.lineTotal ?? 0
}

function _pickName(...candidates: ReadonlyArray<string | null | undefined>) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate
    }
  }
  return null
}

function _parseNumber(value: string): number | null {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function _resolveAvailableStock(
  sku: CartItem['sku'] | null,
): number | null {
  if (!sku) return null

  if (
    typeof sku.availableQuantity === 'number' &&
    Number.isFinite(sku.availableQuantity)
  ) {
    return sku.availableQuantity
  }

  if (typeof sku.quantity === 'number' && Number.isFinite(sku.quantity)) {
    return sku.quantity
  }

  return null
}

function _summariseSelections(
  selections: ReadonlyArray<{
    attributeName?: string | null
    attributeValue?: string | null
  }>,
): string | null {
  const parts: Array<string> = []
  for (const selection of selections) {
    const name = selection.attributeName?.trim()
    const value = selection.attributeValue?.trim()
    if (!value) continue
    parts.push(name ? `${name}: ${value}` : value)
  }
  return parts.length > 0 ? parts.join(' · ') : null
}
