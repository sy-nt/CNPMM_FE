import {
  invalidateCacheByPrefix,
  withCache,
} from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import type { MyRole } from '#/lib/schemas/role.schema'
import { myRoleSchema } from '#/lib/schemas/role.schema'

const MY_ROLE_CACHE_PREFIX = 'role:my:'

export type RoleListQuery = PaginationQuery<'createdAt' | 'updatedAt' | 'name'>

export type CreateRoleInput = {
  name: string
  description?: string
  permissionIds: ReadonlyArray<string>
}

export type UpdateRoleInput = {
  name?: string
  description?: string
  permissionIds?: ReadonlyArray<string>
}

export function getMyRole(
  accessToken: string,  
  signal?: AbortSignal,
): Promise<MyRole> {
  return withCache(
    { key: `${MY_ROLE_CACHE_PREFIX}${accessToken}` },
    async (innerSignal) => {
      const data = await apiRequest<unknown>('/role/', {
        method: 'GET',
        accessToken,
        signal: innerSignal,
      })
      return myRoleSchema.parse(data)
    },
    signal,
  )
}

export function invalidateMyRole(): void {
  invalidateCacheByPrefix(MY_ROLE_CACHE_PREFIX)
}

export function listRoles(
  accessToken: string,
  query: RoleListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/roles/', { method: 'GET', accessToken, query, signal })
}

export function listSystemPermissions(
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/roles/permissions/system', {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function getRole(
  accessToken: string,
  roleId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/role/${roleId}`, { method: 'GET', accessToken, signal })
}

export function createRole(
  accessToken: string,
  input: CreateRoleInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/role/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function updateRole(
  accessToken: string,
  roleId: string,
  input: UpdateRoleInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/role/${roleId}`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteRole(
  accessToken: string,
  roleId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/role/${roleId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
