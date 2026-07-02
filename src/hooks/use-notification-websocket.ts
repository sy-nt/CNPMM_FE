import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'

import {
  NOTIFICATION_WS_EVENTS,
  NOTIFICATION_WS_PING_INTERVAL_MS,
  NOTIFICATION_WS_RECONNECT_BASE_MS,
  NOTIFICATION_WS_RECONNECT_MAX_MS,
} from '#/lib/api/notification.constants'
import { invalidateNotificationQueries } from '#/lib/query/notification'
import { notificationWsMessageSchema } from '#/lib/schemas/notification.schema'
import { buildNotificationWebSocketUrl } from '#/lib/ws/notification-url'
import {
  authStore,
  selectAccessToken,
  selectIsAuthenticated,
} from '#/stores/auth.store'

export function useNotificationWebSocket(): void {
  const queryClient = useQueryClient()
  const accessToken = useStore(authStore, selectAccessToken)
  const isAuthenticated = useStore(authStore, selectIsAuthenticated)
  const reconnectAttemptRef = useRef(0)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const wsUrl = buildNotificationWebSocketUrl(accessToken)
    if (!wsUrl) return

    let isDisposed = false
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let socket: WebSocket | null = null

    const clearPingInterval = (): void => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }
    }

    const scheduleReconnect = (): void => {
      if (isDisposed) return
      const attempt = reconnectAttemptRef.current
      const delay = Math.min(
        NOTIFICATION_WS_RECONNECT_BASE_MS * 2 ** attempt,
        NOTIFICATION_WS_RECONNECT_MAX_MS,
      )
      reconnectAttemptRef.current += 1
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        connect()
      }, delay)
    }

    const handleMessage = (raw: string): void => {
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        return
      }

      const message = notificationWsMessageSchema.safeParse(parsed)
      if (!message.success) return

      if (message.data.event === NOTIFICATION_WS_EVENTS.PING) {
        socket?.send(
          JSON.stringify({ event: NOTIFICATION_WS_EVENTS.PONG }),
        )
        return
      }

      if (message.data.event === NOTIFICATION_WS_EVENTS.PONG) {
        return
      }

      void invalidateNotificationQueries(queryClient)
      toast.info(message.data.data.title, {
        description: message.data.data.body,
      })
    }

    const connect = (): void => {
      if (isDisposed) return
      socket = new WebSocket(wsUrl)

      socket.addEventListener('open', () => {
        reconnectAttemptRef.current = 0
        clearPingInterval()
        pingIntervalRef.current = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({ event: NOTIFICATION_WS_EVENTS.PING }),
            )
          }
        }, NOTIFICATION_WS_PING_INTERVAL_MS)
      })

      socket.addEventListener('message', (event) => {
        if (typeof event.data !== 'string') return
        handleMessage(event.data)
      })

      socket.addEventListener('close', () => {
        clearPingInterval()
        socket = null
        scheduleReconnect()
      })

      socket.addEventListener('error', () => {
        socket?.close()
      })
    }

    connect()

    return () => {
      isDisposed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      clearPingInterval()
      socket?.close()
    }
  }, [accessToken, isAuthenticated, queryClient])
}
