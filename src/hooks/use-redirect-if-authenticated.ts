import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

import { authStore, selectIsAuthenticated } from '#/stores/auth.store'

export function useRedirectIfAuthenticated(): boolean {
  const isAuthenticated = useStore(authStore, selectIsAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return
    void navigate({ to: '/', replace: true })
  }, [isAuthenticated, navigate])

  return isAuthenticated
}
