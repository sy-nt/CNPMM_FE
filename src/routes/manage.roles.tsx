import { createFileRoute } from '@tanstack/react-router'

import { guardManageRoles } from '#/lib/rbac/manage-route-guards'
import { RolesPage } from '#/pages/manage/platform/roles-page'

export const Route = createFileRoute('/manage/roles')({
  beforeLoad: guardManageRoles,
  component: RolesPage,
})
