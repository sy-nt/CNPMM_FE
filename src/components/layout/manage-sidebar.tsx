import { Link, useRouterState } from '@tanstack/react-router'

import { filterManageNavItems } from '#/lib/rbac/manage-nav'
import { usePermissions, useRoleName } from '#/lib/rbac/hooks'
import { MANAGE_NAV_ITEMS } from '#/pages/manage/manage-nav.constants'
import { cn } from '#/lib/utils'

type ManageSidebarProps = {
  className?: string
  orientation?: 'vertical' | 'horizontal'
}

export function ManageSidebar({
  className,
  orientation = 'vertical',
}: ManageSidebarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const permissions = usePermissions()
  const roleName = useRoleName()
  const visibleItems = filterManageNavItems(
    MANAGE_NAV_ITEMS,
    permissions,
    roleName,
  )
  const isHorizontal = orientation === 'horizontal'

  return (
    <nav
      aria-label="Manager"
      className={cn(
        isHorizontal
          ? 'flex gap-2 overflow-x-auto pb-1'
          : 'flex h-fit w-full flex-col gap-4',
        className,
      )}
    >
      {(['platform', 'shop'] as const).map((section) => {
        const sectionItems = visibleItems.filter(
          (item) => item.section === section,
        )
        if (sectionItems.length === 0) return null

        return (
          <div
            key={section}
            className={cn(
              isHorizontal ? 'flex gap-2' : 'flex flex-col gap-1',
            )}
          >
            {!isHorizontal ? (
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section === 'platform' ? 'Platform' : 'Shop'}
              </p>
            ) : null}
            {sectionItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-left transition-colors',
                    isHorizontal && 'shrink-0',
                    isActive
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-transparent bg-card/70 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground',
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        'size-4 shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      {!isHorizontal ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
