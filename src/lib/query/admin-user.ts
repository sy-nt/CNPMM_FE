import { queryOptions } from '@tanstack/react-query'

import { listUsers  } from '#/lib/api/user'
import type {AdminUserListQuery} from '#/lib/api/user';
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { adminUserKeys } from '#/lib/query/keys'

export function adminUserListQueryOptions(
  accessToken: string,
  query: AdminUserListQuery = {},
) {
  return queryOptions({
    queryKey: adminUserKeys.list(accessToken, query),
    queryFn: ({ signal }) => listUsers(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}
