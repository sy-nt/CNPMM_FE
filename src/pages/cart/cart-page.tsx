import { useSuspenseQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { useMemo } from 'react'

import { AppShell } from '#/components/layout/app-shell'
import { cartQueryOptions } from '#/lib/query/cart'
import { buildCartLineView } from '#/pages/cart/_cart-line'
import { groupCartLinesByShop } from '#/pages/cart/_cart-shop-group'
import { computeCartTotals } from '#/pages/cart/_cart-totals'
import { useCartActions } from '#/pages/cart/_use-cart-actions'
import { useCartSelection } from '#/pages/cart/_use-cart-selection'
import { CartPageHeader } from '#/pages/cart/cart-page-header'
import { CartShopList } from '#/pages/cart/cart-shop-list'
import { CartSummary } from '#/pages/cart/cart-summary'
import { EmptyCart } from '#/pages/cart/empty-cart'
import { authStore, selectAccessToken } from '#/stores/auth.store'

export function CartPage() {
  const accessToken = useStore(authStore, selectAccessToken)

  if (!accessToken) {
    throw new Error('Cart requires an authenticated session.')
  }

  const { data: cart } = useSuspenseQuery(cartQueryOptions(accessToken))
  const lines = cart.items.map(buildCartLineView)
  const shopGroups = useMemo(() => groupCartLinesByShop(lines), [lines])

  const { selectedSkuIds, selectedLines, toggleLine, toggleShop } =
    useCartSelection(lines, shopGroups)

  const {
    pendingSkuId,
    pendingAction,
    isClearing,
    onQuantityChange,
    onRemove,
    onClear,
  } = useCartActions(accessToken, lines)

  const { itemCount, selectedCount, derivedSubtotal, serverSubtotal } =
    computeCartTotals(lines, selectedLines, cart.subtotal)

  return (
    <AppShell>
      <section className="rise-in space-y-6">
        <CartPageHeader />

        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <CartShopList
              shopGroups={shopGroups}
              selectedSkuIds={selectedSkuIds}
              pendingSkuId={pendingSkuId}
              pendingAction={pendingAction}
              onToggleShop={toggleShop}
              onToggleLine={toggleLine}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />

            <CartSummary
              itemCount={itemCount}
              selectedCount={selectedCount}
              selectedLines={selectedLines}
              subtotal={derivedSubtotal}
              serverSubtotal={serverSubtotal}
              isClearing={isClearing}
              onClear={onClear}
            />
          </div>
        )}
      </section>
    </AppShell>
  )
}
