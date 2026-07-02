import { Link } from '@tanstack/react-router'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { filterManageNavItems } from '#/lib/rbac/manage-nav'
import { usePermissions, useRoleName } from '#/lib/rbac/hooks'
import { MANAGE_HUB_NAV_ITEMS } from '#/pages/manage/manage-nav.constants'

export function ManageDashboardPage() {
  const permissions = usePermissions()
  const roleName = useRoleName()
  const modules = filterManageNavItems(
    MANAGE_HUB_NAV_ITEMS,
    permissions,
    roleName,
  )

  if (modules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No modules available</CardTitle>
          <CardDescription>
            Your role does not grant access to any manager modules yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Choose a module to open its manager workspace.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon

          return (
            <Link
              key={module.to}
              to={module.to}
              className="group block rounded-xl border border-border bg-card/70 p-0 transition-colors hover:border-primary/40 hover:bg-card"
            >
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-background">
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-primary"
                    />
                  </span>
                  <CardTitle className="text-lg">{module.label}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
