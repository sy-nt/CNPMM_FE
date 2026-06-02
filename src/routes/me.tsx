import { createFileRoute, redirect } from '@tanstack/react-router'

import { AppShell } from '#/components/layout/app-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { listPersonalAddresses } from '#/lib/api/address'
import { ApiError } from '#/lib/api/client'
import { getCurrentUser } from '#/lib/api/user'
import { ensureAuthenticated } from '#/lib/auth-guards'
import type { PersonalAddressList } from '#/lib/schemas/address.schema'
import type { User } from '#/lib/schemas/user.schema'
import { MePage } from '#/pages/me/me-page'
import { authStore } from '#/stores/auth.store'

export type MeLoaderResult = {
  user: User
  addresses: PersonalAddressList
}

export const Route = createFileRoute('/me')({
  beforeLoad: ensureAuthenticated,
  component: MePage,
  pendingComponent: () => (
    <AppShell>
      <LoadingFallback variant="inline" label="Loading your profile…" />
    </AppShell>
  ),
  loader: async ({ abortController }): Promise<MeLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    const signal = abortController.signal
    try {
      const [user, addresses] = await Promise.all([
        getCurrentUser(accessToken, signal),
        listPersonalAddresses(accessToken, signal),
      ])
      return { user, addresses }
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
