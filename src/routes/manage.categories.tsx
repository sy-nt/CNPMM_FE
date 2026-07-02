import { createFileRoute } from '@tanstack/react-router'

import { guardManageCategories } from '#/lib/rbac/manage-route-guards'
import { CategoriesPage } from '#/pages/manage/platform/categories-page'

export const Route = createFileRoute('/manage/categories')({
  beforeLoad: guardManageCategories,
  component: CategoriesPage,
})
