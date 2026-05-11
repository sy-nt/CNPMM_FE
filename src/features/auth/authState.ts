import { tokenStorage } from '@/lib/tokenStorage'

export function isAuthenticated() {
  return Boolean(tokenStorage.getAccessToken())
}

export function signOut() {
  tokenStorage.clear()
}
