const ACCESS_TOKEN_KEY = 'cnpm.accessToken'
const REFRESH_TOKEN_KEY = 'cnpm.refreshToken'

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export const tokenStorage = {
  getAccessToken() {
    return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null
  },

  getRefreshToken() {
    return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null
  },

  getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()
    if (!accessToken || !refreshToken) return null

    return { accessToken, refreshToken }
  },

  setTokens(tokens: AuthTokens) {
    const storage = getStorage()
    storage?.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    storage?.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },

  clear() {
    const storage = getStorage()
    storage?.removeItem(ACCESS_TOKEN_KEY)
    storage?.removeItem(REFRESH_TOKEN_KEY)
  },
}
