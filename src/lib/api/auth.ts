import { apiRequest } from '#/lib/api/client'
import type {
  ActivateAccountPayload,
  ForgotPasswordInput,
  ResetPasswordPayload,
  SignInInput,
  SignUpInput,
} from '#/lib/schemas/auth.schema'
import type { Maybe } from '#/lib/types'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export function signUp(input: SignUpInput, signal?: AbortSignal): Promise<unknown> {
  return apiRequest('/auth/sign-up', { method: 'POST', body: input, signal })
}

export function signIn(input: SignInInput, signal?: AbortSignal): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/auth/login', { method: 'POST', body: input, signal })
}

export function forgotPassword(
  input: ForgotPasswordInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/auth/forgot-password', { method: 'POST', body: input, signal })
}

export function activateAccount(
  input: ActivateAccountPayload,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/auth/activate-account', { method: 'POST', body: input, signal })
}

export function resetPassword(
  input: ResetPasswordPayload,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/auth/reset-password', { method: 'POST', body: input, signal })
}

export function logout(refreshTokenValue: string, signal?: AbortSignal): Promise<unknown> {
  return apiRequest('/auth/logout', {
    method: 'POST',
    accessToken: refreshTokenValue,
    skipAuthRefresh: true,
    signal,
  })
}

export function refreshAuthTokens(
  refreshTokenValue: string,
  signal?: AbortSignal,
): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/auth/refresh-token', {
    method: 'POST',
    accessToken: refreshTokenValue,
    skipAuthRefresh: true,
    signal,
  })
}

export function getAuthStatus(
  accessToken: Maybe<string>,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/auth/status', { method: 'GET', accessToken, signal })
}
