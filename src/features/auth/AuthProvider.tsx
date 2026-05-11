import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { AuthTokens } from '@/lib/tokenStorage'
import { tokenStorage } from '@/lib/tokenStorage'

type AuthContextValue = {
  clearSession: () => void
  isAuthenticated: boolean
  isReady: boolean
  setSession: (tokens: AuthTokens) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsAuthenticated(Boolean(tokenStorage.getAccessToken()))
    setIsReady(true)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      clearSession() {
        tokenStorage.clear()
        setIsAuthenticated(false)
      },
      isAuthenticated,
      isReady,
      setSession(tokens) {
        tokenStorage.setTokens(tokens)
        setIsAuthenticated(true)
      },
    }),
    [isAuthenticated, isReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
