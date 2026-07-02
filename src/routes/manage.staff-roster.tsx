import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/staff-roster')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
