import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { AppShell } from '#/components/layout/app-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { listPersonalAddresses } from '#/lib/api/address'
import { ApiError } from '#/lib/api/client'
import { ensureAuthenticated } from '#/lib/auth-guards'
import { cartQueryOptions } from '#/lib/query/cart'
import { deliveryMethodsQueryOptions } from '#/lib/query/delivery'
import type { PersonalAddressList } from '#/lib/schemas/address.schema'
import type { Cart } from '#/lib/schemas/cart.schema'
import type { DeliveryMethodList } from '#/lib/schemas/delivery.schema'
import type { CheckoutItemSelection } from '#/lib/schemas/order.schema'
import {
  decodeCheckoutSelection,
  resolveCheckoutItems,
} from '#/pages/checkout/_checkout-selection'
import { CheckoutPage } from '#/pages/checkout/checkout-page'
import { authStore } from '#/stores/auth.store'

const checkoutSearchSchema = z.object({
  selection: z.string().trim().min(1).optional().catch(undefined),
})

export type CheckoutLoaderResult = {
  cart: Cart
  addresses: PersonalAddressList
  deliveryMethods: DeliveryMethodList
  items: ReadonlyArray<CheckoutItemSelection>
}

export const Route = createFileRoute('/checkout')({
  beforeLoad: ensureAuthenticated,
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  component: CheckoutRoute,
  pendingComponent: () => (
    <AppShell>
      <LoadingFallback variant="inline" label="Loading checkout…" />
    </AppShell>
  ),
  loader: async ({ context, location }): Promise<CheckoutLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    const { selection } = checkoutSearchSchema.parse(location.search)

    try {
      const [cart, addresses, deliveryMethods] = await Promise.all([
        context.queryClient.ensureQueryData(cartQueryOptions(accessToken)),
        listPersonalAddresses(accessToken),
        context.queryClient.ensureQueryData(
          deliveryMethodsQueryOptions(accessToken),
        ),
      ])

      if (cart.items.length === 0) {
        throw redirect({ to: '/cart' })
      }

      const decoded = decodeCheckoutSelection(selection)
      const items = decoded ? resolveCheckoutItems(decoded, cart) : null
      if (!items) {
        throw redirect({ to: '/cart' })
      }

      return { cart, addresses, deliveryMethods, items }
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

function CheckoutRoute() {
  const { addresses, deliveryMethods, items } = Route.useLoaderData()
  return (
    <CheckoutPage
      addresses={addresses}
      deliveryMethods={deliveryMethods}
      items={items}
    />
  )
}
