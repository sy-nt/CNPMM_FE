import { useStore } from '@tanstack/react-store'
import type { Store } from '@tanstack/store'

import { useHydrated } from '#/hooks/use-hydrated'

export function useClientStore<TState, TValue>(
  store: Store<TState>,
  selector: (state: TState) => TValue,
  serverFallback: TValue,
): TValue {
  const value = useStore(store, selector)
  const isHydrated = useHydrated()
  return isHydrated ? value : serverFallback
}
