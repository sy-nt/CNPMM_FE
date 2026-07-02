import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/shop/images')({
  beforeLoad: () => {
    throw redirect({ to: '/manage/shop' })
  },
})
