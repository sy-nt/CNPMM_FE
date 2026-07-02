import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/orders')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
