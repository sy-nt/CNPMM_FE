import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logout as logoutRequest } from '#/lib/api/auth'
import { invalidateMyRole } from '#/lib/api/role'
import { authStore, clearAuthTokens } from '#/stores/auth.store'

type UseLogoutResult = {
  logout: () => Promise<void>
  isPending: boolean
}

export function useLogout(): UseLogoutResult {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const logout = useCallback(async (): Promise<void> => {
    if (isPending) return
    setIsPending(true)

    const refreshToken = authStore.state.refreshToken
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken).catch((error: unknown) => {
          console.warn('Logout request failed', error)
        })
      }
    } finally {
      invalidateMyRole()
      queryClient.clear()
      clearAuthTokens()
      setIsPending(false)
      toast.success('Signed out.')
      void navigate({ to: '/sign-in', replace: true })
    }
  }, [isPending, navigate, queryClient])

  return { logout, isPending }
}
