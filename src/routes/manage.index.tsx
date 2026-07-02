import { createFileRoute } from '@tanstack/react-router'

import { ManageDashboardPage } from '#/pages/manage/manage-dashboard-page'

export const Route = createFileRoute('/manage/')({
  component: ManageDashboardPage,
})
