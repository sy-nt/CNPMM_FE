import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  listSystemPermissions,
  
  
  
  updateRole
} from '#/lib/api/role'
import type {CreateRoleInput, RoleListQuery, UpdateRoleInput} from '#/lib/api/role';
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { roleKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export type UpdateRoleMutationInput = {
  roleId: string
  input: UpdateRoleInput
}

export function roleListQueryOptions(
  accessToken: string,
  query: RoleListQuery = {},
) {
  return queryOptions({
    queryKey: roleKeys.list(accessToken, query),
    queryFn: ({ signal }) => listRoles(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function systemPermissionsQueryOptions(accessToken: string) {
  return queryOptions({
    queryKey: roleKeys.systemPermissions(accessToken),
    queryFn: ({ signal }) => listSystemPermissions(accessToken, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function roleDetailQueryOptions(accessToken: string, roleId: string) {
  return queryOptions({
    queryKey: roleKeys.detail(accessToken, roleId),
    queryFn: ({ signal }) => getRole(accessToken, roleId, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function invalidateRoleQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: roleKeys.all })
}

export function roleMutations(accessToken: string, queryClient: QueryClient) {
  const afterRoleChange = (): Promise<void> =>
    invalidateRoleQueries(queryClient)

  return {
    create: createMutationOptions({
      mutationKey: roleKeys.mutation('create', accessToken),
      mutationFn: (input: CreateRoleInput) => createRole(accessToken, input),
      afterSuccess: () => afterRoleChange(),
    }),
    update: createMutationOptions({
      mutationKey: roleKeys.mutation('update', accessToken),
      mutationFn: ({ roleId, input }: UpdateRoleMutationInput) =>
        updateRole(accessToken, roleId, input),
      afterSuccess: () => afterRoleChange(),
    }),
    delete: createMutationOptions({
      mutationKey: roleKeys.mutation('delete', accessToken),
      mutationFn: (roleId: string) => deleteRole(accessToken, roleId),
      afterSuccess: () => afterRoleChange(),
    }),
  } as const
}
