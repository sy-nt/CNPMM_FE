import type { Nullable } from '#/lib/types'

type CacheEntry<T> = {
  value: Nullable<T>
  inFlight: Nullable<Promise<T>>
  hasValue: boolean
  expiresAt: number
}

export type WithCacheOptions = {
  key: string
  ttlMs?: number
  forceRefresh?: boolean
}

const _store = new Map<string, CacheEntry<unknown>>()

export async function withCache<T>(
  options: WithCacheOptions,
  fetcher: (signal?: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  const { key, ttlMs = 0, forceRefresh = false } = options
  const now = Date.now()
  const existing = _store.get(key) as CacheEntry<T> | undefined

  if (!forceRefresh && existing?.hasValue) {
    const fresh = existing.expiresAt === 0 || existing.expiresAt > now
    if (fresh) return existing.value as T
  }

  if (!forceRefresh && existing?.inFlight) {
    return existing.inFlight
  }

  const pending = fetcher(signal).then(
    (value) => {
      _store.set(key, {
        value,
        inFlight: null,
        hasValue: true,
        expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
      })
      return value
    },
    (error: unknown) => {
      const fallback = _store.get(key) as CacheEntry<T> | undefined
      if (fallback?.hasValue) {
        _store.set(key, { ...fallback, inFlight: null })
      } else {
        _store.delete(key)
      }
      throw error
    },
  )

  _store.set(key, {
    value: existing?.value ?? null,
    inFlight: pending,
    hasValue: existing?.hasValue ?? false,
    expiresAt: existing?.expiresAt ?? 0,
  })

  return pending
}

export function invalidateCache(key: string): void {
  _store.delete(key)
}

export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of _store.keys()) {
    if (key.startsWith(prefix)) _store.delete(key)
  }
}

export function clearCache(): void {
  _store.clear()
}

export function _cacheSize(): number {
  return _store.size
}
