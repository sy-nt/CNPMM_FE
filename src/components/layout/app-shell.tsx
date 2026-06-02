import type { ReactNode } from 'react'

import { SiteFooter } from '#/components/layout/site-footer'
import { SiteHeader } from '#/components/layout/site-header'
import { cn } from '#/lib/utils'

type AppShellProps = {
  children: ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
