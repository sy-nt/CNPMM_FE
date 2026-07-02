import { useStore } from '@tanstack/react-store'

import { authStore, selectAccessToken } from '#/stores/auth.store'

export function useManageAccessToken(): string {
  const accessToken = useStore(authStore, selectAccessToken)
  if (!accessToken) {
    throw new Error('Manager tools require an authenticated session.')
  }
  return accessToken
}
