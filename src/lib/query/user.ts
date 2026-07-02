import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  assignModerator,
  blockUser,
  deleteCurrentUser,
  getCurrentUser,
  invalidateCurrentUser,
  updateCurrentUser,
} from '#/lib/api/user'
import type {
  AssignModeratorInput,
  BlockUserInput,
  UpdateCurrentUserInput,
} from '#/lib/api/user'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { userKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export function currentUserQueryOptions(accessToken: string) {
  return queryOptions({
    queryKey: userKeys.current(accessToken),
    queryFn: ({ signal }) => getCurrentUser(accessToken, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function invalidateCurrentUserQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: userKeys.all })
}

export function userMutations(accessToken: string, queryClient?: QueryClient) {
  const afterUserChange = (): void => {
    invalidateCurrentUser()
    if (queryClient) {
      void invalidateCurrentUserQueries(queryClient)
    }
  }

  return {
    updateCurrent: createMutationOptions({
      mutationKey: userKeys.mutation('update', accessToken),
      mutationFn: (input: UpdateCurrentUserInput) =>
        updateCurrentUser(accessToken, input),
      afterSuccess: () => {
        afterUserChange()
      },
    }),
    deleteCurrent: createMutationOptions({
      mutationKey: userKeys.mutation('delete', accessToken),
      mutationFn: () => deleteCurrentUser(accessToken),
      afterSuccess: () => {
        afterUserChange()
      },
    }),
    block: createMutationOptions({
      mutationKey: userKeys.mutation('block', accessToken),
      mutationFn: (input: BlockUserInput) => blockUser(accessToken, input),
      afterSuccess: () => {
        afterUserChange()
      },
    }),
    assignModerator: createMutationOptions({
      mutationKey: userKeys.mutation('assign-moderator', accessToken),
      mutationFn: (input: AssignModeratorInput) =>
        assignModerator(accessToken, input),
      afterSuccess: () => {
        afterUserChange()
      },
    }),
  } as const
}
