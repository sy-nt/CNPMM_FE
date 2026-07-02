import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'

import { NotificationInfiniteList } from '#/components/notification/notification-infinite-list'
import { NotificationMarkAllReadButton } from '#/components/notification/notification-mark-all-read-button'
import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { useClientStore } from '#/hooks/use-client-store'
import { useNotificationUnreadCount } from '#/hooks/use-notification-unread-count'
import {
  NOTIFICATION_FILTER_ALL,
  NOTIFICATION_HEADER_PAGE_LIMIT,
  buildNotificationListQuery,
  formatNotificationBadgeCount,
} from '#/lib/api/notification.constants'
import { authStore, selectAccessToken } from '#/stores/auth.store'

export function NotificationBell() {
  const accessToken = useClientStore(authStore, selectAccessToken, null)
  const unreadCount = useNotificationUnreadCount()

  if (!accessToken) return null

  const badgeLabel = formatNotificationBadgeCount(unreadCount)
  const listQuery = buildNotificationListQuery(
    NOTIFICATION_FILTER_ALL,
    NOTIFICATION_HEADER_PAGE_LIMIT,
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label={
            unreadCount > 0
              ? `Notifications (${unreadCount} unread)`
              : 'Notifications'
          }
          className="relative"
        >
          <Bell aria-hidden="true" />
          {badgeLabel ? (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
            >
              {badgeLabel}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <span className="text-xs text-muted-foreground">
                {formatNotificationBadgeCount(unreadCount)} unread
              </span>
            ) : null}
            <NotificationMarkAllReadButton
              accessToken={accessToken}
              unreadCount={unreadCount}
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs"
            />
          </div>
        </div>
        <NotificationInfiniteList
          accessToken={accessToken}
          query={listQuery}
          emptyMessage="No notifications yet."
          compact
          scrollClassName="max-h-96 overflow-y-auto p-2"
        />
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" className="w-full justify-center">
            <Link to="/me/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
