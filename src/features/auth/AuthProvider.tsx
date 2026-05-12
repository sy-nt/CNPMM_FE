import { Provider } from 'react-redux'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import {
  bootstrapSession,
  clearSessionState,
  setSessionState,
} from '@/features/auth/states/authSlice'
import type { AuthTokens } from '@/storage/tokenStorage'
import { tokenStorage } from '@/storage/tokenStorage'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { store } from '@/store/store'

type AuthContextValue = {
  clearSession: () => void
  isAuthenticated: boolean
  isReady: boolean
  setSession: (tokens: AuthTokens) => void
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  )
}

function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(bootstrapSession(tokenStorage.getTokens()))
  }, [dispatch])

  return children
}

export function useAuth(): AuthContextValue {
  const dispatch = useAppDispatch()
  const isReady = useAppSelector((state) => state.auth.isReady)
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.tokens))

  return useMemo(
    () => ({
      clearSession() {
        tokenStorage.clear()
        dispatch(clearSessionState())
      },
      isAuthenticated,
      isReady,
      setSession(tokens: AuthTokens) {
        tokenStorage.setTokens(tokens)
        dispatch(setSessionState(tokens))
      },
    }),
    [dispatch, isAuthenticated, isReady],
  )
}
