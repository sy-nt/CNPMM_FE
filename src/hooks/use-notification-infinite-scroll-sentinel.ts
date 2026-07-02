import { useEffect, useRef } from 'react'

type UseNotificationInfiniteScrollSentinelOptions = {
  enabled: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  root?: Element | null
  rootMargin?: string
}

export function useNotificationInfiniteScrollSentinel({
  enabled,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  root,
  rootMargin = '120px',
}: UseNotificationInfiniteScrollSentinelOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !hasNextPage || isFetchingNextPage) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage()
        }
      },
      {
        root: root ?? null,
        rootMargin,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [
    enabled,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    root,
    rootMargin,
  ])

  return sentinelRef
}
