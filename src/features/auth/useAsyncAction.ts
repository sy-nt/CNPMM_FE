import { useState } from 'react'

import { getApiErrorMessage } from '@/lib/api'

export function useAsyncAction<TArgs extends Array<unknown>, TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) {
  const [data, setData] = useState<TResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function run(...args: TArgs) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await action(...args)
      setData(result)
      return result
    } catch (caughtError) {
      const message = getApiErrorMessage(caughtError)
      setError(message)
      throw caughtError
    } finally {
      setIsLoading(false)
    }
  }

  return {
    data,
    error,
    isLoading,
    resetError: () => setError(null),
    run,
  }
}
