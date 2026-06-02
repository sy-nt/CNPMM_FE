import { redirect } from '@tanstack/react-router'

import { authStore, selectIsAuthenticated } from '#/stores/auth.store'

export function ensureAnonymous(): void {
  if (selectIsAuthenticated(authStore.state)) {
    throw redirect({ to: '/' })
  }
}

export function ensureAuthenticated(): void {
  if (selectIsAuthenticated(authStore.state)) return
  throw redirect({ to: '/sign-in' })
}
