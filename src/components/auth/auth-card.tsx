import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'

type AuthCardProps = {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <Card className={cn('w-full max-w-md rise-in', className)}>
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="display-title text-2xl font-semibold">
            {title}
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer ? (
          <CardFooter className="justify-center text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}
