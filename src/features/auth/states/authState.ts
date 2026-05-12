import { clearSessionState } from '@/features/auth/states/authSlice'
import { tokenStorage } from '@/storage/tokenStorage'
import { store } from '@/store/store'

export function isAuthenticated(): boolean {
  return Boolean(store.getState().auth.tokens)
}

export function signOut(): void {
  tokenStorage.clear()
  store.dispatch(clearSessionState())
}
