import { Store } from '@tanstack/store'

import type { AuthTokens } from '#/lib/api/auth'
import type { PermissionName } from '#/lib/rbac/constants'
import type { MyRole } from '#/lib/schemas/role.schema'
import type { Nullable } from '#/lib/types'

const ACCESS_TOKEN_KEY = 'cnpm.auth.accessToken'
const REFRESH_TOKEN_KEY = 'cnpm.auth.refreshToken'
const PENDING_ACTIVATION_EMAIL_KEY = 'cnpm.auth.pendingActivationEmail'
const ROLE_KEY = 'cnpm.auth.role'

export type AuthRole = {
  id: string
  name: string
  description: Nullable<string>
  permissions: ReadonlyArray<string>
}

export type AuthState = {
  accessToken: Nullable<string>
  refreshToken: Nullable<string>
  pendingActivationEmail: Nullable<string>
  role: Nullable<AuthRole>
}

function _readFromStorage(key: string): Nullable<string> {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function _writeToStorage(key: string, value: Nullable<string>): void {
  if (typeof window === 'undefined') return
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
  }
}

function _readRoleFromStorage(): Nullable<AuthRole> {
  const raw = _readFromStorage(ROLE_KEY)
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as Record<string, unknown>
    const { id, name, description, permissions } = candidate
    if (typeof id !== 'string' || typeof name !== 'string') return null
    if (!Array.isArray(permissions)) return null
    const validPermissions: Array<string> = []
    for (const entry of permissions) {
      if (typeof entry !== 'string') return null
      validPermissions.push(entry)
    }
    return {
      id,
      name,
      description: typeof description === 'string' ? description : null,
      permissions: Object.freeze(validPermissions),
    }
  } catch {
    return null
  }
}

const _initialState: AuthState = {
  accessToken: _readFromStorage(ACCESS_TOKEN_KEY),
  refreshToken: _readFromStorage(REFRESH_TOKEN_KEY),
  pendingActivationEmail: _readFromStorage(PENDING_ACTIVATION_EMAIL_KEY),
  role: _readRoleFromStorage(),
}

export const authStore = new Store<AuthState>(_initialState)

export function setAuthTokens(tokens: AuthTokens): void {
  authStore.setState((state) => ({
    ...state,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }))
  _writeToStorage(ACCESS_TOKEN_KEY, tokens.accessToken)
  _writeToStorage(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearAuthTokens(): void {
  authStore.setState((state) => ({
    ...state,
    accessToken: null,
    refreshToken: null,
    role: null,
  }))
  _writeToStorage(ACCESS_TOKEN_KEY, null)
  _writeToStorage(REFRESH_TOKEN_KEY, null)
  _writeToStorage(ROLE_KEY, null)
}

export function setPendingActivationEmail(email: string): void {
  authStore.setState((state) => ({ ...state, pendingActivationEmail: email }))
  _writeToStorage(PENDING_ACTIVATION_EMAIL_KEY, email)
}

export function clearPendingActivationEmail(): void {
  authStore.setState((state) => ({ ...state, pendingActivationEmail: null }))
  _writeToStorage(PENDING_ACTIVATION_EMAIL_KEY, null)
}

export function setMyRole(myRole: MyRole): void {
  const role: AuthRole = {
    id: myRole.id,
    name: myRole.name,
    description: myRole.description ?? null,
    permissions: Object.freeze([...myRole.permissions]),
  }
  authStore.setState((state) => ({ ...state, role }))
  _writeToStorage(ROLE_KEY, JSON.stringify(role))
}

export function clearMyRole(): void {
  authStore.setState((state) => ({ ...state, role: null }))
  _writeToStorage(ROLE_KEY, null)
}

export const selectAccessToken = (state: AuthState): Nullable<string> =>
  state.accessToken
export const selectIsAuthenticated = (state: AuthState): boolean =>
  Boolean(state.accessToken)
export const selectPendingActivationEmail = (
  state: AuthState,
): Nullable<string> => state.pendingActivationEmail
export const selectRole = (state: AuthState): Nullable<AuthRole> => state.role
export const selectPermissions = (state: AuthState): ReadonlyArray<string> =>
  state.role?.permissions ?? []

export function hasPermission(
  state: AuthState,
  permission: PermissionName,
): boolean {
  return selectPermissions(state).includes(permission)
}

export function hasAnyPermission(
  state: AuthState,
  permissions: ReadonlyArray<PermissionName>,
): boolean {
  if (permissions.length === 0) return true
  const owned = selectPermissions(state)
  return permissions.some((p) => owned.includes(p))
}

export function hasAllPermissions(
  state: AuthState,
  permissions: ReadonlyArray<PermissionName>,
): boolean {
  if (permissions.length === 0) return true
  const owned = selectPermissions(state)
  return permissions.every((p) => owned.includes(p))
}
