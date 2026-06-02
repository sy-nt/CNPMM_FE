import { useState } from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'

import { AppShell } from '#/components/layout/app-shell'
import {
  clearCart,
  invalidateCart,
  removeCartItem,
  updateCartItemQuantity,
} from '#/lib/api/cart'
import { ApiError } from '#/lib/api/client'
import { buildCartLineView, cartLineSubtotal } from '#/pages/cart/_cart-line'
import { CartItemRow } from '#/pages/cart/cart-item-row'
import { CartSummary } from '#/pages/cart/cart-summary'
import { EmptyCart } from '#/pages/cart/empty-cart'
import { authStore, selectAccessToken } from '#/stores/auth.store'

const _routeApi = getRouteApi('/cart')

export function CartPage() {
  const { cart } = _routeApi.useLoaderData()
  const router = useRouter()
  const accessToken = useStore(authStore, selectAccessToken)
  const [pendingSkuId, setPendingSkuId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<
    'update' | 'remove' | null
  >(null)
  const [isClearing, setIsClearing] = useState(false)

  const lines = cart.items.map(buildCartLineView)
  const itemCount = lines.reduce((acc, line) => acc + line.quantity, 0)
  const derivedSubtotal = lines.some((line) => line.lineTotal !== null)
    ? lines.reduce((acc, line) => acc + cartLineSubtotal(line), 0)
    : null
  const serverSubtotal = cart.subtotal ?? null

  const reload = async (): Promise<void> => {
    invalidateCart()
    await router.invalidate()
  }

  const handleQuantityChange = async (
    skuId: string,
    nextQuantity: number,
  ): Promise<void> => {
    if (!accessToken) return
    if (pendingSkuId !== null) return

    const line = lines.find((entry) => entry.skuId === skuId)
    if (!line) return
    if (nextQuantity === line.quantity) return
    if (nextQuantity <= 0) {
      await handleRemove(skuId)
      return
    }

    setPendingSkuId(skuId)
    setPendingAction('update')
    try {
      await updateCartItemQuantity(accessToken, skuId, {
        quantity: nextQuantity,
      })
      await reload()
    } catch (error) {
      toast.error(_humaniseError(error, 'Could not update the cart item.'))
    } finally {
      setPendingSkuId(null)
      setPendingAction(null)
    }
  }

  const handleRemove = async (skuId: string): Promise<void> => {
    if (!accessToken) return
    if (pendingSkuId !== null) return

    setPendingSkuId(skuId)
    setPendingAction('remove')
    try {
      await removeCartItem(accessToken, skuId)
      toast.success('Item removed from your cart.')
      await reload()
    } catch (error) {
      toast.error(_humaniseError(error, 'Could not remove the cart item.'))
    } finally {
      setPendingSkuId(null)
      setPendingAction(null)
    }
  }

  const handleClear = async (): Promise<void> => {
    if (!accessToken) return
    if (isClearing) return

    setIsClearing(true)
    try {
      await clearCart(accessToken)
      toast.success('Cart cleared.')
      await reload()
    } catch (error) {
      toast.error(_humaniseError(error, 'Could not clear the cart.'))
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <AppShell>
      <section className="rise-in space-y-6">
        <header className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Cart
          </p>
          <h1 className="display-title text-3xl font-semibold text-foreground">
            Your cart
          </h1>
          <p className="text-sm text-muted-foreground">
            Review your items before continuing to checkout.
          </p>
        </header>

        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <ul className="space-y-3">
              {lines.map((line) => (
                <CartItemRow
                  key={line.key}
                  line={line}
                  isUpdating={
                    pendingSkuId === line.skuId && pendingAction === 'update'
                  }
                  isRemoving={
                    pendingSkuId === line.skuId && pendingAction === 'remove'
                  }
                  onQuantityChange={(skuId, next) => {
                    void handleQuantityChange(skuId, next)
                  }}
                  onRemove={(skuId) => {
                    void handleRemove(skuId)
                  }}
                />
              ))}
            </ul>

            <CartSummary
              itemCount={itemCount}
              subtotal={derivedSubtotal}
              serverSubtotal={serverSubtotal}
              isClearing={isClearing}
              onClear={() => void handleClear()}
            />
          </div>
        )}
      </section>
    </AppShell>
  )
}

function _humaniseError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback
  }
  return fallback
}
