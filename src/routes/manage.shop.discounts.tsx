import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/shop/discounts')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
