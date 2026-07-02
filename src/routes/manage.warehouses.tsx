import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/warehouses')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
