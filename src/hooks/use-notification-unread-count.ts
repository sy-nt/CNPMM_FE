import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'

import { notificationUnreadCountQueryOptions } from '#/lib/query/notification'
import {
  authStore,
  selectAccessToken,
  selectIsAuthenticated,
} from '#/stores/auth.store'

export function useNotificationUnreadCount(): number {
  const accessToken = useStore(authStore, selectAccessToken)
  const isAuthenticated = useStore(authStore, selectIsAuthenticated)

  const { data } = useQuery({
    ...notificationUnreadCountQueryOptions(accessToken ?? ''),
    enabled: isAuthenticated && Boolean(accessToken),
  })

  return data ?? 0
}
