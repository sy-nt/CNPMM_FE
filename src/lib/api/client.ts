import type { Maybe, Nullable } from '#/lib/types'
import { authStore, clearAuthTokens, setAuthTokens } from '#/stores/auth.store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as Maybe<string>

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(
    message: string,
    status: number,
    options?: { code?: string; cause?: unknown },
  ) {
    super(message, { cause: options?.cause })
    this.name = 'ApiError'
    this.status = status
    this.code = options?.code
  }
}

export type QueryParamPrimitive = string | number | boolean
export type QueryParams = Record<
  string,
  Maybe<QueryParamPrimitive | ReadonlyArray<QueryParamPrimitive>>
>

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
  accessToken?: Maybe<string>
  query?: QueryParams
  skipAuthRefresh?: boolean
}

type AuthTokens = {
  accessToken: string
  refreshToken: string
}

const REFRESH_TOKEN_PATH = '/auth/refresh-token'

let _refreshInFlight: Nullable<Promise<Nullable<string>>> = null

export async function apiRequest<TData = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<TData> {
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL is not configured', 0, {
      code: 'config/missing-base-url',
    })
  }

  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    accessToken,
    query,
    skipAuthRefresh = false,
  } = options

  const finalHeaders: Record<string, string> = { ...headers }
  if (body !== undefined) {
    finalHeaders['Content-Type'] ??= 'application/json'
  }
  if (accessToken) {
    finalHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  const url = `${API_BASE_URL}${path}${_buildQueryString(query)}`

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (
      response.status === 401 &&
      Boolean(accessToken) &&
      !skipAuthRefresh &&
      !signal?.aborted
    ) {
      const nextAccessToken = await _resolveRefreshedAccessToken(accessToken!)
      if (
        nextAccessToken &&
        nextAccessToken !== accessToken &&
        !signal?.aborted
      ) {
        return apiRequest<TData>(path, {
          ...options,
          accessToken: nextAccessToken,
          skipAuthRefresh: true,
        })
      }
    }
    throw new ApiError(
      _pickErrorMessage(payload, response.status),
      response.status,
      {
        code: _pickErrorCode(payload),
      },
    )
  }

  return _pickData<TData>(payload)
}

async function _resolveRefreshedAccessToken(
  usedAccessToken: string,
): Promise<Nullable<string>> {
  const storedAccessToken = authStore.state.accessToken
  if (storedAccessToken && storedAccessToken !== usedAccessToken) {
    return storedAccessToken
  }
  return _refreshAccessTokenOnce()
}

function _refreshAccessTokenOnce(): Promise<Nullable<string>> {
  _refreshInFlight ??= _runRefresh().finally(() => {
    _refreshInFlight = null
  })
  return _refreshInFlight
}

async function _runRefresh(): Promise<Nullable<string>> {
  const refreshTokenValue = authStore.state.refreshToken
  if (!refreshTokenValue) {
    clearAuthTokens()
    return null
  }
  try {
    const tokens = await apiRequest<AuthTokens>(REFRESH_TOKEN_PATH, {
      method: 'POST',
      accessToken: refreshTokenValue,
      skipAuthRefresh: true,
    })
    setAuthTokens(tokens)
    return tokens.accessToken
  } catch {
    clearAuthTokens()
    return null
  }
}

function _pickErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (typeof obj.message === 'string' && obj.message.length > 0)
      return obj.message
    if (obj.error && typeof obj.error === 'object') {
      const err = obj.error as Record<string, unknown>
      if (typeof err.message === 'string' && err.message.length > 0)
        return err.message
    }
    if (typeof obj.error === 'string' && obj.error.length > 0) return obj.error
  }
  return `Request failed (${status})`
}

function _pickErrorCode(payload: unknown): string | undefined {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (typeof obj.code === 'string') return obj.code
    if (obj.error && typeof obj.error === 'object') {
      const err = obj.error as Record<string, unknown>
      if (typeof err.code === 'string') return err.code
    }
  }
  return undefined
}

function _pickData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

function _buildQueryString(params: QueryParams | undefined): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry === null || entry === undefined) continue
        search.append(key, String(entry))
      }
      continue
    }
    search.append(key, String(value))
  }
  const serialised = search.toString()
  return serialised.length > 0 ? `?${serialised}` : ''
}
