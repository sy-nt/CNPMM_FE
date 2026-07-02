import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

type ManageAsyncStateProps = {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  children: ReactNode
}

export function ManageAsyncState({
  isLoading,
  isError,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
}: ManageAsyncStateProps): ReactNode {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          <CardTitle className="text-base">Loading…</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We could not load this resource. Try again in a moment.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{emptyTitle}</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return children
}
