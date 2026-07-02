import type { ReactNode } from 'react'

import { MeSidebar } from '#/components/layout/me-sidebar'
import { SiteFooter } from '#/components/layout/site-footer'
import { SiteHeader } from '#/components/layout/site-header'
import { cn } from '#/lib/utils'

type MeShellProps = {
  children: ReactNode
  header: ReactNode
  className?: string
}

export function MeShell({ children, header, className }: MeShellProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <SiteHeader />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">
        <section className="rise-in space-y-6">
          {header}
          <MeSidebar className="md:hidden" orientation="horizontal" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
            <MeSidebar className="hidden md:flex" />
            <main className="min-w-0">{children}</main>
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  )
}
