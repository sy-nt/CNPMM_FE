import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/shop/moderators')({
  beforeLoad: () => {
    throw redirect({ to: '/manage/shop/workers' })
  },
})
