import { createFileRoute, redirect } from '@tanstack/react-router'

import { LoadingFallback } from '#/components/loading-fallback'
import { listPersonalAddresses } from '#/lib/api/address'
import { ApiError } from '#/lib/api/client'
import type { PersonalAddressList } from '#/lib/schemas/address.schema'
import { AddressesPage } from '#/pages/me/addresses-page'
import { authStore } from '#/stores/auth.store'

export type MeAddressesLoaderResult = {
  addresses: PersonalAddressList
}

export const Route = createFileRoute('/me/addresses')({
  component: AddressesPage,
  pendingComponent: () => (
    <LoadingFallback variant="inline" label="Loading addresses…" />
  ),
  loader: async ({ abortController }): Promise<MeAddressesLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    try {
      const addresses = await listPersonalAddresses(
        accessToken,
        abortController.signal,
      )
      return { addresses }
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
