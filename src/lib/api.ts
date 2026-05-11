import axios, { AxiosError, AxiosHeaders } from 'axios'

import { tokenStorage  } from './tokenStorage'
import type {AuthTokens} from './tokenStorage';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'

export type ApiResponse<T> = {
  data: T
  message: string
  statusCode: number
}

export type LoginRequest = {
  email: string
  password: string
}

export type SignUpRequest = LoginRequest & {
  firstName?: string
  imageUrl?: string
  lastName?: string
}

export type ActivateAccountRequest = {
  email: string
  otp: number
}

export type UserProfile = {
  email: string
  firstName?: string | null
  id: string
  imageUrl?: string | null
  isActive?: boolean
  lastName?: string | null
}

export type UpdateProfileRequest = {
  firstName?: string
  imageUrl?: string
  lastName?: string
  password?: string
}

type ApiErrorBody = {
  message?: string
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken()

  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    config.headers = headers
  }

  return config
})

export function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined
    return body?.message ?? error.message
  }

  if (error instanceof Error) return error.message

  return 'Something went wrong. Please try again.'
}

export const authApi = {
  async activateAccount(payload: ActivateAccountRequest) {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/activate-account',
      payload,
    )
    return response.data
  },

  async login(payload: LoginRequest) {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/login',
      payload,
    )
    return response.data
  },

  async logout() {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) return

    await apiClient.post<ApiResponse<void>>('/auth/logout', undefined, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
  },

  async refreshToken() {
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

  async signUp(payload: SignUpRequest) {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/sign-up',
      payload,
    )
    return response.data
  },
}

export const userApi = {
  async getCurrentUser() {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/user/')
    return response.data
  },

  async updateCurrentUser(payload: UpdateProfileRequest) {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(
      '/user/',
      payload,
    )
    return response.data
  },
}
