import type { Cart } from '#/lib/schemas/cart.schema'
import type { CheckoutItemSelection } from '#/lib/schemas/order.schema'
import { checkoutItemSelectionSchema } from '#/lib/schemas/order.schema'
import type { CartLineView } from '#/pages/cart/_cart-line'

const CHECKOUT_ITEM_PART_SEPARATOR = ':'
const CHECKOUT_SELECTION_SEPARATOR = '|'

export function buildCheckoutItemsFromLines(
  lines: ReadonlyArray<CartLineView>,
): ReadonlyArray<CheckoutItemSelection> {
  return lines
    .filter((line) => !line.isInactive)
    .map((line) => ({ skuId: line.skuId, quantity: line.quantity }))
}

export function encodeCheckoutSelection(
  items: ReadonlyArray<CheckoutItemSelection>,
): string {
  return items
    .map(
      (item) =>
        `${item.skuId}${CHECKOUT_ITEM_PART_SEPARATOR}${item.quantity ?? ''}`,
    )
    .join(CHECKOUT_SELECTION_SEPARATOR)
}

export function decodeCheckoutSelection(
  selection: string | undefined,
): ReadonlyArray<CheckoutItemSelection> | null {
  if (!selection?.trim()) return null

  const items: Array<CheckoutItemSelection> = []
  for (const part of selection.split(CHECKOUT_SELECTION_SEPARATOR)) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const separatorIndex = trimmed.indexOf(CHECKOUT_ITEM_PART_SEPARATOR)
    if (separatorIndex <= 0) continue

    const skuId = trimmed.slice(0, separatorIndex)
    const quantityRaw = trimmed.slice(separatorIndex + 1)
    const parsed = checkoutItemSelectionSchema.safeParse({
      skuId,
      ...(quantityRaw.length > 0
        ? { quantity: Number.parseInt(quantityRaw, 10) }
        : {}),
    })
    if (parsed.success) {
      items.push(parsed.data)
    }
  }

  return items.length > 0 ? items : null
}

export function resolveCheckoutItems(
  selection: ReadonlyArray<CheckoutItemSelection>,
  cart: Cart,
): ReadonlyArray<CheckoutItemSelection> | null {
  if (selection.length === 0) return null

  const resolved: Array<CheckoutItemSelection> = []
  for (const item of selection) {
    const cartItem = cart.items.find((entry) => entry.skuId === item.skuId)
    if (!cartItem || cartItem.isAvailable === false) return null

    const quantity = item.quantity ?? cartItem.quantity
    if (quantity < 1 || quantity > cartItem.quantity) return null

    resolved.push({ skuId: item.skuId, quantity })
  }

  return resolved.length > 0 ? resolved : null
}

export function countCheckoutItems(
  items: ReadonlyArray<CheckoutItemSelection>,
): number {
  return items.reduce((total, item) => total + (item.quantity ?? 0), 0)
}
