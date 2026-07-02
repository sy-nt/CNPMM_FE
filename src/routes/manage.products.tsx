import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/products')({
  beforeLoad: () => {
    throw redirect({ to: '/forbidden' })
  },
})
