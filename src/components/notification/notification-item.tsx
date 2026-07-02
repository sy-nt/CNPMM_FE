import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Loader2, Package } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { formatDateTime } from '#/lib/datetime'
import { notificationMutations } from '#/lib/query/notification'
import type { Notification } from '#/lib/schemas/notification.schema'
import { cn } from '#/lib/utils'

type NotificationItemProps = {
  accessToken: string
  notification: Notification
  onNotificationChange?: () => void | Promise<void>
  compact?: boolean
}

export function NotificationItem({
  accessToken,
  notification,
  onNotificationChange,
  compact = false,
}: NotificationItemProps) {
  const queryClient = useQueryClient()
  const mutations = notificationMutations(accessToken, queryClient)
  const markRead = useMutation(mutations.markRead)
  const markUnread = useMutation(mutations.markUnread)

  const isUnread = notification.readAt === null
  const createdAtLabel = formatDateTime(notification.createdAt, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const hasOrderLink = _hasOrderLink(notification)
  const isPending = markRead.isPending || markUnread.isPending

  const handleToggleRead = async (): Promise<void> => {
    if (isPending) return

    if (isUnread) {
      await markRead.mutateAsync({ notificationId: notification.id })
    } else {
      await markUnread.mutateAsync({ notificationId: notification.id })
    }

    await onNotificationChange?.()
  }

  const handleMarkRead = async (): Promise<void> => {
    if (!isUnread || isPending) return
    await markRead.mutateAsync({ notificationId: notification.id })
    await onNotificationChange?.()
  }

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border px-3 py-3 transition-colors',
        isUnread
          ? 'border-primary/20 bg-primary/5'
          : 'border-transparent bg-card/70',
        compact && 'px-2 py-2',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
          isUnread ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <Package aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            {notification.title}
          </p>
          {isUnread ? (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              New
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{notification.body}</p>
        {createdAtLabel ? (
          <p className="text-xs text-muted-foreground">{createdAtLabel}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {hasOrderLink && !compact ? (
            <Button
              asChild
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs"
            >
              <Link
                to="/me/orders"
                onClick={() => {
                  void handleMarkRead()
                }}
              >
                View order
              </Link>
            </Button>
          ) : null}
          {!compact ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs"
              disabled={isPending}
              onClick={() => {
                void handleToggleRead()
              }}
            >
              {isPending ? (
                <Loader2 aria-hidden="true" className="size-3 animate-spin" />
              ) : isUnread ? (
                'Mark as read'
              ) : (
                'Mark as unread'
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function _hasOrderLink(notification: Notification): boolean {
  const orderId = notification.data.orderId
  return typeof orderId === 'string' && orderId.length > 0
}
