import type { ReactNode } from 'react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

type ManageComingSoonProps = {
  title: string
  description: string
}

export function ManageComingSoon({
  title,
  description,
}: ManageComingSoonProps): ReactNode {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
