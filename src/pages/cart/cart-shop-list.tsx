import type { CartShopGroup } from '#/pages/cart/_cart-shop-group'
import type { CartPendingAction } from '#/pages/cart/_use-cart-actions'
import { CartShopSection } from '#/pages/cart/cart-shop-section'

type CartShopListProps = {
  shopGroups: ReadonlyArray<CartShopGroup>
  selectedSkuIds: ReadonlySet<string>
  pendingSkuId: string | null
  pendingAction: CartPendingAction
  onToggleShop: (shopId: string, selected: boolean) => void
  onToggleLine: (skuId: string, selected: boolean) => void
  onQuantityChange: (skuId: string, nextQuantity: number) => void
  onRemove: (skuId: string) => void
}

export function CartShopList({
  shopGroups,
  selectedSkuIds,
  pendingSkuId,
  pendingAction,
  onToggleShop,
  onToggleLine,
  onQuantityChange,
  onRemove,
}: CartShopListProps) {
  return (
    <div className="space-y-5">
      {shopGroups.map((group) => (
        <CartShopSection
          key={group.shopId}
          group={group}
          selectedSkuIds={selectedSkuIds}
          pendingSkuId={pendingSkuId}
          pendingAction={pendingAction}
          onToggleShop={onToggleShop}
          onToggleLine={onToggleLine}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
