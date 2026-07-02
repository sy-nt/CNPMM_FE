import type { Maybe } from '#/lib/types'

import { NOTIFICATION_WS_PATH } from '#/lib/api/notification.constants'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as Maybe<string>

export function buildNotificationWebSocketUrl(
  accessToken: string,
): string | null {
  if (!API_BASE_URL) return null

  try {
    const apiUrl = new URL(API_BASE_URL)
    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = new URL(
      NOTIFICATION_WS_PATH,
      `${protocol}//${apiUrl.host}`,
    )
    wsUrl.searchParams.set('token', accessToken)
    return wsUrl.toString()
  } catch {
    return null
  }
}
