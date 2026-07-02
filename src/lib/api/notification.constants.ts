import { PAGINATION_DEFAULTS } from '#/lib/api/common'
import type { NotificationListQuery } from '#/lib/api/notification'

export const NOTIFICATION_WS_PATH = '/ws/notifications'

export const NOTIFICATION_WS_EVENTS = {
  NOTIFICATION: 'notification',
  PING: 'ping',
  PONG: 'pong',
} as const

export const NOTIFICATION_WS_PING_INTERVAL_MS = 30_000

export const NOTIFICATION_WS_RECONNECT_BASE_MS = 1_000

export const NOTIFICATION_WS_RECONNECT_MAX_MS = 30_000

export const NOTIFICATION_FILTER_ALL = 'all' as const

export const NOTIFICATION_FILTER_UNREAD = 'unread' as const

export type NotificationFilter =
  | typeof NOTIFICATION_FILTER_ALL
  | typeof NOTIFICATION_FILTER_UNREAD

export const NOTIFICATION_FILTER_TABS: ReadonlyArray<{
  value: NotificationFilter
  label: string
}> = [
  { value: NOTIFICATION_FILTER_ALL, label: 'All' },
  { value: NOTIFICATION_FILTER_UNREAD, label: 'Unread' },
] as const

export const NOTIFICATION_HEADER_PAGE_LIMIT = 15

export const NOTIFICATION_BADGE_MAX_COUNT = 99

export const NOTIFICATION_UNREAD_PROBE_LIMIT = 50

export const NOTIFICATION_SCROLL_LOAD_THRESHOLD_PX = 48

export const NOTIFICATION_LIST_DEFAULT_QUERY: Omit<
  NotificationListQuery,
  'lastId'
> = {
  limit: PAGINATION_DEFAULTS.LIMIT,
  sort: PAGINATION_DEFAULTS.SORT,
}

export function buildNotificationListQuery(
  filter: NotificationFilter,
  limit: number = PAGINATION_DEFAULTS.LIMIT,
): Omit<NotificationListQuery, 'lastId'> {
  return {
    limit,
    sort: PAGINATION_DEFAULTS.SORT,
    ...(filter === NOTIFICATION_FILTER_UNREAD ? { unreadOnly: true } : {}),
  }
}

export function formatNotificationBadgeCount(count: number): string {
  if (count <= 0) return ''
  if (count > NOTIFICATION_BADGE_MAX_COUNT) {
    return `${NOTIFICATION_BADGE_MAX_COUNT}+`
  }
  return String(count)
}
