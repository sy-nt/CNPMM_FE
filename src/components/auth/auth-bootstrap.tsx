import { useEffect } from 'react'
import { useStore } from '@tanstack/react-store'

import { getMyRole, invalidateMyRole } from '#/lib/api/role'
import {
  authStore,
  clearAuthTokens,
  selectAccessToken,
  selectRole,
  setMyRole,
} from '#/stores/auth.store'

export function AuthBootstrap(): null {
  const accessToken = useStore(authStore, selectAccessToken)
  const role = useStore(authStore, selectRole)

  useEffect(() => {
    if (!accessToken) return
    if (role) return

    const controller = new AbortController()
    getMyRole(accessToken, controller.signal)
      .then(setMyRole)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (_isUnauthorized(error)) {
          invalidateMyRole()
          clearAuthTokens()
        } else {
          console.error('Failed to fetch role/permissions', error)
        }
      })

    return () => controller.abort()
  }, [accessToken, role])

  return null
}

function _isUnauthorized(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  if (!('status' in error)) return false
  return error.status === 401
}
