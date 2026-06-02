import { invalidateCacheByPrefix, withCache } from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import { userSchema } from '#/lib/schemas/user.schema'
import type { User } from '#/lib/schemas/user.schema'

const CURRENT_USER_CACHE_PREFIX = 'user:current:'

export type UpdateCurrentUserInput = {
  firstName?: string
  lastName?: string
  imageUrl?: string
}

export type BlockUserInput = {
  email: string
}

export type UserListQuery = PaginationQuery<'createdAt' | 'updatedAt' | 'email'>

export function getCurrentUser(
  accessToken: string,
  signal?: AbortSignal,
): Promise<User> {
  return withCache(
    { key: `${CURRENT_USER_CACHE_PREFIX}${accessToken}` },
    async (innerSignal) => {
      const data = await apiRequest<unknown>('/user/', {
        method: 'GET',
        accessToken,
        signal: innerSignal,
      })
      return userSchema.parse(data)
    },
    signal,
  )
}

export function updateCurrentUser(
  accessToken: string,
  input: UpdateCurrentUserInput,
  signal?: AbortSignal,
): Promise<User> {
  return apiRequest<unknown>('/user/', {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  }).then((data) => userSchema.parse(data))
}

export function invalidateCurrentUser(): void {
  invalidateCacheByPrefix(CURRENT_USER_CACHE_PREFIX)
}

export function deleteCurrentUser(
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/user/', { method: 'DELETE', accessToken, signal })
}

export function blockUser(
  accessToken: string,
  input: BlockUserInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/user/block', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function listUsers(
  accessToken: string,
  query: UserListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/users/', { method: 'GET', accessToken, query, signal })
}
