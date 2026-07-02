import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { NotificationListQuery } from '#/lib/api/notification'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '#/lib/api/notification'
import {
  NOTIFICATION_BADGE_MAX_COUNT,
  NOTIFICATION_UNREAD_PROBE_LIMIT,
} from '#/lib/api/notification.constants'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { notificationKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'
import type { Notification } from '#/lib/schemas/notification.schema'

export function notificationListQueryOptions(
  accessToken: string,
  query: NotificationListQuery,
) {
  return queryOptions({
    queryKey: notificationKeys.list(accessToken, query),
    queryFn: ({ signal }) => listNotifications(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function notificationInfiniteQueryOptions(
  accessToken: string,
  query: Omit<NotificationListQuery, 'lastId'>,
) {
  return infiniteQueryOptions({
    queryKey: notificationKeys.infinite(accessToken, query),
    queryFn: ({ pageParam, signal }) =>
      listNotifications(
        accessToken,
        {
          ...query,
          ...(pageParam ? { lastId: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage && lastPage.lastId ? lastPage.lastId : undefined,
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function notificationUnreadCountQueryOptions(accessToken: string) {
  return queryOptions({
    queryKey: notificationKeys.unreadCount(accessToken),
    queryFn: ({ signal }) =>
      listNotifications(
        accessToken,
        {
          limit: NOTIFICATION_UNREAD_PROBE_LIMIT,
          sort: 'desc',
          unreadOnly: true,
        },
        signal,
      ),
    staleTime: QUERY_STALE_TIME_MS,
    select: (data) =>
      data.hasNextPage ? NOTIFICATION_BADGE_MAX_COUNT + 1 : data.items.length,
  })
}

export function invalidateNotificationQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: notificationKeys.all })
}

export type MarkNotificationMutationInput = {
  notificationId: string
}

export function notificationMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterChange = (): Promise<void> =>
    invalidateNotificationQueries(queryClient)

  return {
    markRead: createMutationOptions({
      mutationKey: notificationKeys.mutation('mark-read', accessToken),
      mutationFn: (input: MarkNotificationMutationInput) =>
        markNotificationRead(accessToken, input.notificationId),
      afterSuccess: afterChange,
    }),
    markUnread: createMutationOptions({
      mutationKey: notificationKeys.mutation('mark-unread', accessToken),
      mutationFn: (input: MarkNotificationMutationInput) =>
        markNotificationUnread(accessToken, input.notificationId),
      afterSuccess: afterChange,
    }),
    markAllRead: createMutationOptions({
      mutationKey: notificationKeys.mutation('mark-all-read', accessToken),
      mutationFn: () => markAllNotificationsRead(accessToken),
      afterSuccess: afterChange,
    }),
  } as const
}

export function flattenNotificationPages(
  pages:
    | ReadonlyArray<{ items: ReadonlyArray<Notification> }>
    | undefined,
): Notification[] {
  if (!pages) return []
  return pages.flatMap((page) => page.items)
}
