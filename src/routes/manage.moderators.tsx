import { createFileRoute } from '@tanstack/react-router'

import { guardManageModerators } from '#/lib/rbac/manage-route-guards'
import { PlatformModeratorsPage } from '#/pages/manage/platform/moderators-page'

export const Route = createFileRoute('/manage/moderators')({
  beforeLoad: guardManageModerators,
  component: PlatformModeratorsPage,
})
