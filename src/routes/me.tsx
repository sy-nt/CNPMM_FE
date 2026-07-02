import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { MeShell } from '#/components/layout/me-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { ApiError } from '#/lib/api/client'
import { getCurrentUser } from '#/lib/api/user'
import { ensureAuthenticated } from '#/lib/auth-guards'
import type { User } from '#/lib/schemas/user.schema'
import { MeHeader } from '#/pages/me/me-header'
import { authStore } from '#/stores/auth.store'

export type MeLayoutLoaderResult = {
  user: User
}

export const Route = createFileRoute('/me')({
  beforeLoad: ensureAuthenticated,
  component: MeLayout,
  pendingComponent: () => (
    <MeShell
      header={<LoadingFallback variant="inline" label="Loading your account…" />}
    >
      <LoadingFallback variant="inline" label="Loading…" />
    </MeShell>
  ),
  loader: async ({ abortController }): Promise<MeLayoutLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    try {
      const user = await getCurrentUser(accessToken, abortController.signal)
      return { user }
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

function MeLayout() {
  const { user } = Route.useLoaderData()

  return (
    <MeShell header={<MeHeader user={user} />}>
      <Outlet />
    </MeShell>
  )
}
