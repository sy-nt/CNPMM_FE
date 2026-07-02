import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/shop')({
  component: ManageShopLayout,
})

function ManageShopLayout() {
  return <Outlet />
}
