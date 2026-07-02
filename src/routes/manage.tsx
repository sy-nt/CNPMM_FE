import { createFileRoute, Outlet } from '@tanstack/react-router'

import { ManageShell } from '#/components/layout/manage-shell'
import { LoadingFallback } from '#/components/loading-fallback'
import { ensureAuthenticated } from '#/lib/auth-guards'
import { ensureManagerRole } from '#/lib/rbac/guards'
import { ManageHeader } from '#/pages/manage/manage-header'

export const Route = createFileRoute('/manage')({
  beforeLoad: () => {
    ensureAuthenticated()
    ensureManagerRole()
  },
  component: ManageLayout,
  pendingComponent: () => (
    <ManageShell
      header={
        <LoadingFallback variant="inline" label="Loading manager tools…" />
      }
    >
      <LoadingFallback variant="inline" label="Loading…" />
    </ManageShell>
  ),
})

function ManageLayout() {
  return (
    <ManageShell header={<ManageHeader />}>
      <Outlet />
    </ManageShell>
  )
}
