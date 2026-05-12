import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { AuthTokens } from '@/storage/tokenStorage'
import type { UserProfile } from '@/services/user/types'

type AuthState = {
  isReady: boolean
  tokens: AuthTokens | null
  user: UserProfile | null
}

const initialState: AuthState = {
  isReady: false,
  tokens: null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    bootstrapSession(state, action: PayloadAction<AuthTokens | null>) {
      state.tokens = action.payload
      state.isReady = true
    },
    clearSessionState(state) {
      state.tokens = null
      state.user = null
    },
    setSessionState(state, action: PayloadAction<AuthTokens>) {
      state.tokens = action.payload
    },
    setUserState(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload
    },
  },
})

export const {
  bootstrapSession,
  clearSessionState,
  setSessionState,
  setUserState,
} = authSlice.actions

export const authReducer = authSlice.reducer
