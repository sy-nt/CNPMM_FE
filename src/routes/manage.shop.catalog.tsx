import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/shop/catalog')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
