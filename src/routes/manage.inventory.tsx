import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/inventory')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
