import type { ReactNode } from 'react'

import { CategorySidebar } from '#/components/layout/category-sidebar'
import { SiteFooter } from '#/components/layout/site-footer'
import { SiteHeader } from '#/components/layout/site-header'
import { cn } from '#/lib/utils'

type CategoryShellProps = {
  children: ReactNode
  activeCategorySlug?: string
  className?: string
}

export function CategoryShell({
  children,
  activeCategorySlug,
  className,
}: CategoryShellProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 lg:px-6">
        <CategorySidebar
          className="hidden w-64 shrink-0 md:flex"
          activeCategorySlug={activeCategorySlug}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <SiteFooter />
    </div>
  )
}
