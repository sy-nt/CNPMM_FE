import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/users')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
