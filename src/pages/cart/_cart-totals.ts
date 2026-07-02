import { cartLineSubtotal } from '#/pages/cart/_cart-line'
import type { CartLineView } from '#/pages/cart/_cart-line'

export type CartTotals = {
  itemCount: number
  selectedCount: number
  derivedSubtotal: number | null
  serverSubtotal: string | null
}

export function computeCartTotals(
  lines: ReadonlyArray<CartLineView>,
  selectedLines: ReadonlyArray<CartLineView>,
  cartSubtotal: string | null | undefined,
): CartTotals {
  const itemCount = lines.reduce((acc, line) => acc + line.quantity, 0)
  const selectedCount = selectedLines.reduce(
    (acc, line) => acc + line.quantity,
    0,
  )
  const derivedSubtotal = selectedLines.some((line) => line.lineTotal !== null)
    ? selectedLines.reduce((acc, line) => acc + cartLineSubtotal(line), 0)
    : null
  const serverSubtotal =
    selectedLines.length === lines.length ? (cartSubtotal ?? null) : null

  return { itemCount, selectedCount, derivedSubtotal, serverSubtotal }
}
