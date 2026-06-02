import { useCallback, useEffect, useRef, useState } from 'react'

export type UseFetchStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseFetchOptions = {
  enabled?: boolean
  deps?: ReadonlyArray<unknown>
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

export type UseFetchResult<TData> = {
  data: TData | null
  error: Error | null
  status: UseFetchStatus
  isIdle: boolean
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  refetch: () => Promise<void>
}

export function useFetch<TData>(
  fetcher: (signal: AbortSignal) => Promise<TData>,
  options: UseFetchOptions = {},
): UseFetchResult<TData> {
  const { enabled = true, deps = [], onSuccess, onError } = options

  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<UseFetchStatus>(
    enabled ? 'loading' : 'idle',
  )

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const controllerRef = useRef<AbortController | null>(null)

  const run = useCallback(async (): Promise<void> => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus('loading')
    setError(null)

    try {
      const result = await fetcherRef.current(controller.signal)
      if (controller.signal.aborted) return
      setData(result)
      setStatus('success')
      onSuccessRef.current?.(result)
    } catch (caught) {
      if (controller.signal.aborted) return
      const normalized = _toError(caught)
      setError(normalized)
      setStatus('error')
      onErrorRef.current?.(normalized)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      return
    }
    void run()
    return () => {
      controllerRef.current?.abort()
    }
  }, [enabled, run, ...deps])

  return {
    data,
    error,
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    refetch: run,
  }
}

function _toError(value: unknown): Error {
  if (value instanceof Error) return value
  if (typeof value === 'string') return new Error(value)
  return new Error('Unknown fetch error')
}
