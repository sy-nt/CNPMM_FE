import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { LoadingFallback } from '#/components/loading-fallback'
import { ApiError } from '#/lib/api/client'
import {
  NOTIFICATION_FILTER_ALL,
  NOTIFICATION_FILTER_UNREAD,
  buildNotificationListQuery,
} from '#/lib/api/notification.constants'
import type { NotificationFilter } from '#/lib/api/notification.constants'
import { notificationInfiniteQueryOptions } from '#/lib/query/notification'
import { NotificationsPage } from '#/pages/me/notifications-page'
import { authStore } from '#/stores/auth.store'

const notificationsSearchSchema = z.object({
  filter: z
    .enum([NOTIFICATION_FILTER_ALL, NOTIFICATION_FILTER_UNREAD])
    .optional()
    .catch(undefined),
})

export type MeNotificationsLoaderResult = {
  filter: NotificationFilter
}

export const Route = createFileRoute('/me/notifications')({
  validateSearch: (search) => notificationsSearchSchema.parse(search),
  component: NotificationsPage,
  pendingComponent: () => (
    <LoadingFallback variant="inline" label="Loading notifications…" />
  ),
  loaderDeps: ({ search }) => ({
    filter: search.filter ?? NOTIFICATION_FILTER_ALL,
  }),
  loader: async ({ context, deps }): Promise<MeNotificationsLoaderResult> => {
    const accessToken = authStore.state.accessToken
    if (!accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    const filter = deps.filter

    try {
      await context.queryClient.prefetchInfiniteQuery(
        notificationInfiniteQueryOptions(
          accessToken,
          buildNotificationListQuery(filter),
        ),
      )
      return { filter }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        throw redirect({ to: '/sign-in' })
      }
      throw error
    }
  },
})
