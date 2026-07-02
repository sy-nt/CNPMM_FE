import { useNotificationWebSocket } from '#/hooks/use-notification-websocket'

export function NotificationBootstrap(): null {
  useNotificationWebSocket()
  return null
}
