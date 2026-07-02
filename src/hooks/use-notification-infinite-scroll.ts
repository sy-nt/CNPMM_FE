import { useCallback } from 'react'
import type { UIEvent } from 'react'

import { NOTIFICATION_SCROLL_LOAD_THRESHOLD_PX } from '#/lib/api/notification.constants'

type UseNotificationInfiniteScrollOptions = {
  enabled: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function useNotificationInfiniteScroll({
  enabled,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseNotificationInfiniteScrollOptions) {
  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>): void => {
      if (!enabled || !hasNextPage || isFetchingNextPage) return

      const element = event.currentTarget
      const distanceToBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight

      if (distanceToBottom <= NOTIFICATION_SCROLL_LOAD_THRESHOLD_PX) {
        fetchNextPage()
      }
    },
    [enabled, fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  return handleScroll
}
