import { z } from 'zod'

import { apiDateTimeStringSchema } from '#/lib/datetime'

export const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'order_created',
  ORDER_STATUS_CHANGED: 'order_status_changed',
} as const

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  type: z.enum([
    NOTIFICATION_TYPES.ORDER_CREATED,
    NOTIFICATION_TYPES.ORDER_STATUS_CHANGED,
  ]),
  data: z.record(z.string(), z.unknown()),
  createdAt: apiDateTimeStringSchema,
  readAt: apiDateTimeStringSchema.nullable(),
})
export type Notification = z.infer<typeof notificationSchema>

export const notificationListResponseSchema = z
  .object({
    items: z.array(notificationSchema),
    hasNextPage: z.boolean(),
    lastId: z.string().optional(),
  })
  .catch(() => ({
    items: [],
    hasNextPage: false,
    lastId: undefined,
  }))
export type NotificationListResponse = z.infer<
  typeof notificationListResponseSchema
>

export const markAllNotificationsReadResponseSchema = z.object({
  updatedCount: z.number().int().nonnegative(),
})
export type MarkAllNotificationsReadResponse = z.infer<
  typeof markAllNotificationsReadResponseSchema
>

export const notificationWsMessageSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('notification'),
    data: notificationSchema,
  }),
  z.object({
    event: z.literal('ping'),
  }),
  z.object({
    event: z.literal('pong'),
  }),
])
export type NotificationWsMessage = z.infer<typeof notificationWsMessageSchema>
