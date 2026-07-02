import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

import { AddressesSection } from '#/pages/me/addresses-section'
import { authStore, selectAccessToken } from '#/stores/auth.store'

const _routeApi = getRouteApi('/me/addresses')

export function AddressesPage() {
  const { addresses } = _routeApi.useLoaderData()
  const router = useRouter()
  const accessToken = useStore(authStore, selectAccessToken)

  if (!accessToken) {
    throw new Error('Addresses require an authenticated session.')
  }

  return (
    <AddressesSection
      accessToken={accessToken}
      addresses={addresses}
      onChange={() => router.invalidate()}
    />
  )
}
