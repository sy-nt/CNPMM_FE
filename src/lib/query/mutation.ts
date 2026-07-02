import { mutationOptions } from '@tanstack/react-query'
import type { MutationKey } from '@tanstack/react-query'

type AfterMutationSuccess<TData, TVariables> = (
  data: TData,
  variables: TVariables,
) => void | Promise<void>

export function createMutationOptions<TData, TVariables>({
  mutationKey,
  mutationFn,
  afterSuccess,
}: {
  mutationKey: MutationKey
  mutationFn: (variables: TVariables) => Promise<TData>
  afterSuccess?:
    | AfterMutationSuccess<TData, TVariables>
    | ReadonlyArray<AfterMutationSuccess<TData, TVariables>>
}) {
  const handlers = afterSuccess
    ? Array.isArray(afterSuccess)
      ? afterSuccess
      : [afterSuccess]
    : []

  return mutationOptions({
    mutationKey,
    mutationFn,
    onSuccess:
      handlers.length > 0
        ? async (data, variables) => {
            for (const handler of handlers) {
              await handler(data, variables)
            }
          }
        : undefined,
  })
}
