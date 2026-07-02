import { getRouteApi, Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Bell } from 'lucide-react'

import { NotificationInfiniteList } from '#/components/notification/notification-infinite-list'
import { NotificationMarkAllReadButton } from '#/components/notification/notification-mark-all-read-button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useNotificationUnreadCount } from '#/hooks/use-notification-unread-count'
import {
  NOTIFICATION_FILTER_ALL,
  NOTIFICATION_FILTER_TABS,
  buildNotificationListQuery,
} from '#/lib/api/notification.constants'
import { authStore, selectAccessToken } from '#/stores/auth.store'
import { cn } from '#/lib/utils'

const _routeApi = getRouteApi('/me/notifications')

export function NotificationsPage() {
  const { filter } = _routeApi.useLoaderData()
  const accessToken = useStore(authStore, selectAccessToken)
  const unreadCount = useNotificationUnreadCount()

  if (!accessToken) {
    throw new Error('Notifications require an authenticated session.')
  }

  const listQuery = buildNotificationListQuery(filter)
  const emptyMessage =
    filter === NOTIFICATION_FILTER_ALL
      ? 'No notifications yet.'
      : 'No unread notifications.'

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Order updates and account alerts appear here in real time.
          </p>
        </div>
        <NotificationMarkAllReadButton
          accessToken={accessToken}
          unreadCount={unreadCount}
          variant="outline"
          size="sm"
          className="shrink-0"
        />
      </div>

      <nav
        aria-label="Notification filter"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {NOTIFICATION_FILTER_TABS.map((tab) => {
          const isActive = filter === tab.value
          return (
            <Link
              key={tab.value}
              to="/me/notifications"
              search={{
                filter:
                  tab.value === NOTIFICATION_FILTER_ALL ? undefined : tab.value,
              }}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <NotificationInfiniteList
        key={filter}
        accessToken={accessToken}
        query={listQuery}
        emptyMessage={emptyMessage}
        scrollMode="viewport"
        emptyFallback={
          <Card>
            <CardHeader className="items-center text-center">
              <span
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground"
              >
                <Bell aria-hidden="true" className="size-8" />
              </span>
              <CardTitle>
                {filter === NOTIFICATION_FILTER_ALL
                  ? 'No notifications yet'
                  : 'No unread notifications'}
              </CardTitle>
              <CardDescription>
                {filter === NOTIFICATION_FILTER_ALL
                  ? 'You will see order updates and alerts here when they arrive.'
                  : 'You are all caught up.'}
              </CardDescription>
            </CardHeader>
          </Card>
        }
      />
    </section>
  )
}
