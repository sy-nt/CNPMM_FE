import axios, { AxiosError, AxiosHeaders } from 'axios'

import type { ApiErrorBody } from '@/services/types'
import { tokenStorage } from '@/storage/tokenStorage'

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'

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

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined
    return body?.message ?? error.message
  }

  if (error instanceof Error) return error.message

  return 'Something went wrong. Please try again.'
}
