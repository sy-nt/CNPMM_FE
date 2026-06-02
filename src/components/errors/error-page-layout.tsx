import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

type ErrorPageLayoutProps = {
  /** Big numeric status code rendered above the title. */
  code: string
  title: string
  description: ReactNode
  /** Action row (links, buttons) rendered below the description. */
  actions?: ReactNode
  className?: string
}

export function ErrorPageLayout({
  code,
  title,
  description,
  actions,
  className,
}: ErrorPageLayoutProps) {
  return (
    <main
      role="main"
      className={cn(
        'flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="rise-in flex flex-col items-center gap-4">
        <p
          aria-hidden="true"
          className="display-title text-7xl font-bold tracking-tight text-primary/80 sm:text-8xl"
        >
          {code}
        </p>
        <h1 className="display-title text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      ) : null}
    </main>
  )
}
