import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { NotificationList } from '#/components/notification/notification-list'
import { useNotificationInfiniteScroll } from '#/hooks/use-notification-infinite-scroll'
import { useNotificationInfiniteScrollSentinel } from '#/hooks/use-notification-infinite-scroll-sentinel'
import type { NotificationListQuery } from '#/lib/api/notification'
import {
  flattenNotificationPages,
  notificationInfiniteQueryOptions,
} from '#/lib/query/notification'

type NotificationInfiniteScrollMode = 'element' | 'viewport'

type NotificationInfiniteListProps = {
  accessToken: string
  query: Omit<NotificationListQuery, 'lastId'>
  emptyMessage: string
  compact?: boolean
  className?: string
  scrollClassName?: string
  scrollMode?: NotificationInfiniteScrollMode
  enabled?: boolean
  emptyFallback?: ReactNode
  onNotificationChange?: () => void | Promise<void>
}

export function NotificationInfiniteList({
  accessToken,
  query,
  emptyMessage,
  compact = false,
  className,
  scrollClassName,
  scrollMode = 'element',
  enabled = true,
  emptyFallback,
  onNotificationChange,
}: NotificationInfiniteListProps) {
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...notificationInfiniteQueryOptions(accessToken, query),
    enabled,
  })

  const notifications = flattenNotificationPages(data?.pages)

  const loadMore = (): void => {
    void fetchNextPage()
  }

  const handleElementScroll = useNotificationInfiniteScroll({
    enabled: enabled && scrollMode === 'element',
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage: loadMore,
  })

  const viewportSentinelRef = useNotificationInfiniteScrollSentinel({
    enabled: enabled && scrollMode === 'viewport',
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage: loadMore,
  })

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-5 animate-spin" />
        <span className="sr-only">Loading notifications…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
        Could not load notifications.
      </p>
    )
  }

  if (notifications.length === 0) {
    return (
      emptyFallback ?? (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )
    )
  }

  const listContent = (
    <>
      <NotificationList
        accessToken={accessToken}
        notifications={notifications}
        emptyMessage={emptyMessage}
        compact={compact}
        onNotificationChange={onNotificationChange}
      />
      {isFetchingNextPage ? (
        <div className="flex items-center justify-center py-3 text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          <span className="sr-only">Loading more notifications…</span>
        </div>
      ) : null}
      {scrollMode === 'viewport' ? (
        <div ref={viewportSentinelRef} aria-hidden="true" className="h-px" />
      ) : null}
      {!isFetchingNextPage && hasNextPage && scrollMode === 'element' ? (
        <p className="py-2 text-center text-xs text-muted-foreground">
          Scroll for more
        </p>
      ) : null}
    </>
  )

  if (scrollMode === 'viewport') {
    return <div className={className}>{listContent}</div>
  }

  return (
    <div className={className}>
      <div className={scrollClassName} onScroll={handleElementScroll}>
        {listContent}
      </div>
    </div>
  )
}
