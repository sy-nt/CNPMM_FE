import { invalidateCacheByPrefix, withCache } from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import type { PaginationSort } from '#/lib/api/common'
import {
  adminUserListResponseSchema,
  assignModeratorInputSchema,
  blockUserInputSchema,
  updateCurrentUserInputSchema,
  userSchema,
} from '#/lib/schemas/user.schema'
import type {
  AdminUserListResponse,
  AssignModeratorInput,
  BlockUserInput,
  UpdateCurrentUserInput,
  User,
} from '#/lib/schemas/user.schema'

const CURRENT_USER_CACHE_PREFIX = 'user:current:'

export type AdminUserListQuery = {
  lastId?: string
  limit?: number
  sort?: PaginationSort
  email?: string
}

export type { AssignModeratorInput, BlockUserInput, UpdateCurrentUserInput }

export async function listUsers(
  accessToken: string,
  query: AdminUserListQuery = {},
  signal?: AbortSignal,
): Promise<AdminUserListResponse> {
  const raw = await apiRequest<unknown>('/admin/users/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return adminUserListResponseSchema.parse(raw)
}

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
  const body = updateCurrentUserInputSchema.parse(input)
  return apiRequest<unknown>('/user/', {
    method: 'PATCH',
    accessToken,
    body,
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
  const body = blockUserInputSchema.parse(input)
  return apiRequest('/user/block', {
    method: 'POST',
    accessToken,
    body,
    signal,
  })
}

export function assignModerator(
  accessToken: string,
  input: AssignModeratorInput,
  signal?: AbortSignal,
): Promise<unknown> {
  const body = assignModeratorInputSchema.parse(input)
  return apiRequest('/admin/users/moderator', {
    method: 'POST',
    accessToken,
    body,
    signal,
  })
}
