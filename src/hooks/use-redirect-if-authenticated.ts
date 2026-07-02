import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

import { getPostAuthRedirect } from '#/lib/auth-redirect'
import { authStore, selectIsAuthenticated, selectRole } from '#/stores/auth.store'

export function useRedirectIfAuthenticated(): boolean {
  const isAuthenticated = useStore(authStore, selectIsAuthenticated)
  const roleName = useStore(authStore, (state) => selectRole(state)?.name ?? null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return
    void navigate({ to: getPostAuthRedirect(roleName), replace: true })
  }, [isAuthenticated, roleName, navigate])

  return isAuthenticated
}
