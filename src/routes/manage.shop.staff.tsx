import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/shop/staff')({
  beforeLoad: () => {
    throw redirect({ to: '/manage/shop/workers' })
  },
})
