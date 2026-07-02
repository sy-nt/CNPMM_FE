import type { Notification } from '#/lib/schemas/notification.schema'

import { NotificationItem } from '#/components/notification/notification-item'

type NotificationListProps = {
  accessToken: string
  notifications: ReadonlyArray<Notification>
  emptyMessage: string
  compact?: boolean
  onNotificationChange?: () => void | Promise<void>
}

export function NotificationList({
  accessToken,
  notifications,
  emptyMessage,
  compact = false,
  onNotificationChange,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="space-y-1">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <NotificationItem
            accessToken={accessToken}
            notification={notification}
            compact={compact}
            onNotificationChange={onNotificationChange}
          />
        </li>
      ))}
    </ul>
  )
}
