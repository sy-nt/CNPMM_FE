import { createFileRoute, redirect } from '@tanstack/react-router'

import { AppShell } from '#/components/layout/app-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { getCart } from '#/lib/api/cart'
import { ApiError } from '#/lib/api/client'
import { ensureAuthenticated } from '#/lib/auth-guards'
import type { Cart } from '#/lib/schemas/cart.schema'
import { CartPage } from '#/pages/cart/cart-page'
import { authStore } from '#/stores/auth.store'

export type CartLoaderResult = {
  cart: Cart
}

export const Route = createFileRoute('/cart')({
  beforeLoad: ensureAuthenticated,
  component: CartPage,
  pendingComponent: () => (
    <AppShell>
      <LoadingFallback variant="inline" label="Loading your cart…" />
    </AppShell>
  ),
  loader: async ({ abortController }): Promise<CartLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    try {
      const cart = await getCart(accessToken, abortController.signal)
      return { cart }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        throw redirect({ to: '/sign-in' })
      }
      throw error
    }
  },
})
