import type { AuthTokens } from '@/storage/tokenStorage'
import { tokenStorage } from '@/storage/tokenStorage'
import { apiClient } from '@/services/api-client'
import type {
  ActivateAccountRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest,
} from '@/services/auth/types'
import type { ApiResponse } from '@/services/types'

export const authApi = {
  async activateAccount(payload: ActivateAccountRequest): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/activate-account',
      payload,
    )
    return response.data
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/forgot-password',
      payload,
    )
    return response.data
  },

  async login(payload: LoginRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/login',
      payload,
    )
    return response.data
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) return

    await apiClient.post<ApiResponse<void>>('/auth/logout', undefined, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
  },

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) throw new Error('Missing refresh token')

    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/refresh-token',
      undefined,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    )

    return response.data
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/reset-password',
      payload,
    )
    return response.data
  },

  async signUp(payload: SignUpRequest): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/sign-up', payload)
    return response.data
  },
}

export type { AuthTokens } from '@/storage/tokenStorage'
export type {
  ActivateAccountRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest,
} from '@/services/auth/types'
