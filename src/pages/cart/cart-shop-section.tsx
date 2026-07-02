import {
  activeSkuIdsInGroup,
  type CartShopGroup,
} from '#/pages/cart/_cart-shop-group'
import type { CartPendingAction } from '#/pages/cart/_use-cart-actions'
import { CartItemRow } from '#/pages/cart/cart-item-row'

type CartShopSectionProps = {
  group: CartShopGroup
  selectedSkuIds: ReadonlySet<string>
  pendingSkuId: string | null
  pendingAction: CartPendingAction
  onToggleShop: (shopId: string, selected: boolean) => void
  onToggleLine: (skuId: string, selected: boolean) => void
  onQuantityChange: (skuId: string, nextQuantity: number) => void
  onRemove: (skuId: string) => void
}

export function CartShopSection({
  group,
  selectedSkuIds,
  pendingSkuId,
  pendingAction,
  onToggleShop,
  onToggleLine,
  onQuantityChange,
  onRemove,
}: CartShopSectionProps) {
  const { shopId, shopName, lines: shopLines } = group
  const activeSkuIds = activeSkuIdsInGroup(group)
  const allSelected =
    activeSkuIds.length > 0 &&
    activeSkuIds.every((skuId) => selectedSkuIds.has(skuId))
  const someSelected =
    activeSkuIds.some((skuId) => selectedSkuIds.has(skuId)) && !allSelected

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="size-4 rounded border-border text-primary accent-primary"
            checked={allSelected}
            ref={(node) => {
              if (!node) return
              node.indeterminate = someSelected
            }}
            onChange={(event) => onToggleShop(shopId, event.target.checked)}
            aria-label={`Select all items in ${shopName}`}
            disabled={activeSkuIds.length === 0}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{shopName}</p>
            <p className="text-xs text-muted-foreground">
              {shopLines.length} {shopLines.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </div>

      <ul>
        {shopLines.map((line) => (
          <CartItemRow
            key={line.key}
            line={line}
            embedded
            selected={selectedSkuIds.has(line.skuId)}
            onSelectedChange={onToggleLine}
            isUpdating={
              pendingSkuId === line.skuId && pendingAction === 'update'
            }
            isRemoving={
              pendingSkuId === line.skuId && pendingAction === 'remove'
            }
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  )
}
