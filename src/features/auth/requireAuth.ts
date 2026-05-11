import { redirect } from '@tanstack/react-router'

import { tokenStorage } from '@/lib/tokenStorage'

export function requireAuth() {
  if (typeof window === 'undefined') return

  if (!tokenStorage.getAccessToken()) {
    throw redirect({ to: '/login' })
  }
}
