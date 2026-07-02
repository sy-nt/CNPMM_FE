import {
  invalidateCacheByPrefix,
  withCache,
} from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import type { MyRole } from '#/lib/schemas/role.schema'
import {
  myRoleSchema,
  roleDetailSchema,
  roleListResponseSchema,
  systemPermissionListSchema,
} from '#/lib/schemas/role.schema'
import type {
  RoleDetail,
  RoleListResponse,
  SystemPermissionList,
} from '#/lib/schemas/role.schema'

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

export async function listRoles(
  accessToken: string,
  query: RoleListQuery = {},
  signal?: AbortSignal,
): Promise<RoleListResponse> {
  const raw = await apiRequest<unknown>('/admin/roles/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return roleListResponseSchema.parse(raw)
}

export async function listSystemPermissions(
  accessToken: string,
  signal?: AbortSignal,
): Promise<SystemPermissionList> {
  const raw = await apiRequest<unknown>('/admin/roles/permissions/system', {
    method: 'GET',
    accessToken,
    signal,
  })
  return systemPermissionListSchema.parse(raw)
}

export async function getRole(
  accessToken: string,
  roleId: string,
  signal?: AbortSignal,
): Promise<RoleDetail> {
  const raw = await apiRequest<unknown>(`/admin/role/${roleId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
  return roleDetailSchema.parse(raw)
}

export async function createRole(
  accessToken: string,
  input: CreateRoleInput,
  signal?: AbortSignal,
): Promise<RoleDetail> {
  const raw = await apiRequest<unknown>('/admin/role/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
  return roleDetailSchema.parse(raw)
}

export async function updateRole(
  accessToken: string,
  roleId: string,
  input: UpdateRoleInput,
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest(`/admin/role/${roleId}`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
}

export async function deleteRole(
  accessToken: string,
  roleId: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest(`/admin/role/${roleId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
