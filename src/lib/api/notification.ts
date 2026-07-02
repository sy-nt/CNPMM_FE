import { apiRequest } from '#/lib/api/client'
import type { PaginationSort } from '#/lib/api/common'
import {
  markAllNotificationsReadResponseSchema,
  notificationListResponseSchema,
  notificationSchema,
} from '#/lib/schemas/notification.schema'
import type {
  MarkAllNotificationsReadResponse,
  Notification,
  NotificationListResponse,
} from '#/lib/schemas/notification.schema'

export type NotificationListQuery = {
  limit?: number
  sort?: PaginationSort
  lastId?: string
  unreadOnly?: boolean
}

export async function listNotifications(
  accessToken: string,
  query: NotificationListQuery = {},
  signal?: AbortSignal,
): Promise<NotificationListResponse> {
  const raw = await apiRequest<unknown>('/notifications/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return notificationListResponseSchema.parse(raw)
}

export async function markAllNotificationsRead(
  accessToken: string,
  signal?: AbortSignal,
): Promise<MarkAllNotificationsReadResponse> {
  const raw = await apiRequest<unknown>('/notifications/read-all', {
    method: 'PATCH',
    accessToken,
    signal,
  })
  return markAllNotificationsReadResponseSchema.parse(raw)
}

export async function markNotificationRead(
  accessToken: string,
  notificationId: string,
  signal?: AbortSignal,
): Promise<Notification> {
  const raw = await apiRequest<unknown>(`/notification/${notificationId}/read`, {
    method: 'PATCH',
    accessToken,
    signal,
  })
  return notificationSchema.parse(raw)
}

export async function markNotificationUnread(
  accessToken: string,
  notificationId: string,
  signal?: AbortSignal,
): Promise<Notification> {
  const raw = await apiRequest<unknown>(
    `/notification/${notificationId}/unread`,
    {
      method: 'PATCH',
      accessToken,
      signal,
    },
  )
  return notificationSchema.parse(raw)
}
