import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'

import {
  cartQueryOptions,
  countCartItems,
} from '#/lib/query/cart'
import {
  authStore,
  selectAccessToken,
  selectIsAuthenticated,
} from '#/stores/auth.store'

export function useCartItemCount(): number {
  const accessToken = useStore(authStore, selectAccessToken)
  const isAuthenticated = useStore(authStore, selectIsAuthenticated)

  const { data } = useQuery({
    ...cartQueryOptions(accessToken ?? ''),
    enabled: isAuthenticated && Boolean(accessToken),
  })

  return countCartItems(data)
}
