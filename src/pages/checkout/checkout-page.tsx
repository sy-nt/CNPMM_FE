import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'
import { z } from 'zod'

import { AppShell } from '#/components/layout/app-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ApiError } from '#/lib/api/client'
import {
  checkoutPreviewQueryOptions,
  orderMutations,
} from '#/lib/query/order'
import type { PersonalAddressList } from '#/lib/schemas/address.schema'
import type { DeliveryMethodList } from '#/lib/schemas/delivery.schema'
import type {
  CheckoutItemSelection,
  CheckoutPreviewInput,
} from '#/lib/schemas/order.schema'
import { countCheckoutItems } from '#/pages/checkout/_checkout-selection'
import { CheckoutAddressPicker } from '#/pages/checkout/checkout-address-picker'
import { CheckoutDeliveryPicker } from '#/pages/checkout/checkout-delivery-picker'
import { CheckoutPageHeader } from '#/pages/checkout/checkout-page-header'
import { CheckoutPreviewBundles } from '#/pages/checkout/checkout-preview-bundles'
import { CheckoutSummary } from '#/pages/checkout/checkout-summary'
import { authStore, selectAccessToken } from '#/stores/auth.store'

export type CheckoutPageProps = {
  addresses: PersonalAddressList
  deliveryMethods: DeliveryMethodList
  items: ReadonlyArray<CheckoutItemSelection>
}

export function CheckoutPage({
  addresses,
  deliveryMethods,
  items,
}: CheckoutPageProps) {
  const accessToken = useStore(authStore, selectAccessToken)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  if (!accessToken) {
    throw new Error('Checkout requires an authenticated session.')
  }

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => _defaultAddressId(addresses),
  )
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    () => _defaultMethodId(deliveryMethods),
  )

  const previewInput = useMemo((): CheckoutPreviewInput | null => {
    if (!selectedAddressId || !selectedMethodId || items.length === 0) {
      return null
    }
    return {
      destinationAddressId: selectedAddressId,
      deliveryMethodId: selectedMethodId,
      items: [...items],
    }
  }, [selectedAddressId, selectedMethodId, items])

  const previewQuery = useQuery(
    checkoutPreviewQueryOptions(accessToken, previewInput),
  )
  const placeOrder = useMutation(orderMutations(accessToken, queryClient).place)

  const itemCount = countCheckoutItems(items)
  const preview = previewQuery.data
  const previewError = _humanisePreviewError(previewQuery.error)
  const canPlaceOrder =
    Boolean(preview?.grandTotal) &&
    Boolean(selectedAddressId) &&
    Boolean(selectedMethodId) &&
    !previewQuery.isFetching &&
    !previewError

  const handlePlaceOrder = async (): Promise<void> => {
    if (!previewInput || !preview?.grandTotal) return

    try {
      const result = await placeOrder.mutateAsync({
        ...previewInput,
        expectedTotalAmount: preview.grandTotal,
        idempotencyKey: crypto.randomUUID(),
      })
      const orderCount = result.orders.length
      toast.success(
        orderCount === 1
          ? 'Your order has been placed.'
          : `${orderCount} orders have been placed.`,
      )
      await navigate({ to: '/' })
    } catch (error) {
      toast.error(_humanisePlaceError(error))
    }
  }

  const hasPrerequisites =
    addresses.length > 0 && deliveryMethods.some((method) => method.isActive)

  return (
    <AppShell>
      <section className="rise-in space-y-6">
        <CheckoutPageHeader />

        {itemCount === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your cart is empty</CardTitle>
              <CardDescription>
                Add items to your cart before checking out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" asChild>
                <Link to="/">Continue shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : !hasPrerequisites ? (
          <Card>
            <CardHeader>
              <CardTitle>Checkout is not ready</CardTitle>
              <CardDescription>
                {addresses.length === 0
                  ? 'Add a delivery address on your profile to continue.'
                  : 'No active shipping methods are available right now.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {addresses.length === 0 ? (
                <Button type="button" asChild>
                  <Link to="/me/addresses">Manage addresses</Link>
                </Button>
              ) : null}
              <Button type="button" variant="outline" asChild>
                <Link to="/cart">Back to cart</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <div className="space-y-8">
              <CheckoutAddressPicker
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelect={setSelectedAddressId}
              />
              <CheckoutDeliveryPicker
                methods={deliveryMethods}
                selectedMethodId={selectedMethodId}
                onSelect={setSelectedMethodId}
              />
              {previewQuery.isLoading && previewInput ? (
                <LoadingFallback
                  variant="inline"
                  label="Calculating order preview…"
                />
              ) : null}
              {preview ? <CheckoutPreviewBundles bundles={preview.bundles} /> : null}
            </div>

            <CheckoutSummary
              itemCount={itemCount}
              grandTotal={preview?.grandTotal ?? null}
              canPlaceOrder={canPlaceOrder}
              isPreviewLoading={previewQuery.isLoading && !preview}
              isPlacing={placeOrder.isPending}
              previewError={previewError}
              onPlaceOrder={() => void handlePlaceOrder()}
            />
          </div>
        )}
      </section>
    </AppShell>
  )
}

function _defaultAddressId(addresses: PersonalAddressList): string | null {
  if (addresses.length === 0) return null
  const primary = addresses.find((address) => address.isPrimary)
  return primary?.id ?? addresses[0].id
}

function _defaultMethodId(methods: DeliveryMethodList): string | null {
  const active = methods.filter((method) => method.isActive)
  return active[0]?.id ?? null
}

function _humanisePreviewError(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) {
    return error.message || 'Could not preview your order.'
  }
  if (error instanceof z.ZodError) {
    return 'Order preview response was invalid. Please try again.'
  }
  return 'Could not preview your order.'
}

function _humanisePlaceError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || 'Could not place your order.'
  }
  return 'Could not place your order.'
}
