import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/shop/deliveries')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
