import { redirect } from '@tanstack/react-router'

import { store } from '@/store/store'

export function requireAuth() {
  if (typeof window === 'undefined') return

  if (!store.getState().auth.tokens?.accessToken) {
    throw redirect({ to: '/login' })
  }
}
