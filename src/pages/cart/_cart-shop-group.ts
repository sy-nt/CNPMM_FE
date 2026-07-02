import type { CartLineView } from '#/pages/cart/_cart-line'

export const UNKNOWN_SHOP_ID = 'unknown'
export const UNKNOWN_SHOP_LABEL = 'Shop'

export type CartShopGroup = {
  shopId: string
  shopName: string
  lines: ReadonlyArray<CartLineView>
}

export function groupCartLinesByShop(
  lines: ReadonlyArray<CartLineView>,
): ReadonlyArray<CartShopGroup> {
  const groups = new Map<string, CartShopGroup>()

  for (const line of lines) {
    const shopId = line.shopId ?? UNKNOWN_SHOP_ID
    const existing = groups.get(shopId)

    if (existing) {
      groups.set(shopId, { ...existing, lines: [...existing.lines, line] })
      continue
    }

    groups.set(shopId, {
      shopId,
      shopName: line.shopName ?? UNKNOWN_SHOP_LABEL,
      lines: [line],
    })
  }

  return Array.from(groups.values())
}

export function activeSkuIdsInGroup(
  group: CartShopGroup,
): ReadonlyArray<string> {
  return group.lines
    .filter((line) => !line.isInactive)
    .map((line) => line.skuId)
}
