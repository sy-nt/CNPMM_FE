import { Link, useRouterState } from '@tanstack/react-router'

import { usePermissions } from '#/lib/rbac/hooks'
import { SHOP_PERMISSIONS } from '#/lib/rbac/constants'
import { ME_NAV_ITEMS } from '#/pages/me/me-nav.constants'
import { cn } from '#/lib/utils'

type MeSidebarProps = {
  className?: string
  orientation?: 'vertical' | 'horizontal'
}

export function MeSidebar({
  className,
  orientation = 'vertical',
}: MeSidebarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const permissions = usePermissions()
  const isHorizontal = orientation === 'horizontal'
  const navItems = ME_NAV_ITEMS.filter(
    (item) =>
      item.to !== '/me/shop' ||
      permissions.includes(SHOP_PERMISSIONS.SHOP_REGISTER),
  )

  return (
    <nav
      aria-label="Account"
      className={cn(
        isHorizontal
          ? 'flex gap-2 overflow-x-auto pb-1'
          : 'flex h-fit w-full flex-col gap-1',
        className,
      )}
    >
      {navItems.map((item) => {
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
                <span className="block text-sm font-semibold">{item.label}</span>
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
    </nav>
  )
}
