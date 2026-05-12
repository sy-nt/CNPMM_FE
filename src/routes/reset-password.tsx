import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

import { RouteLoader } from '@/components/auth/RouteLoader'

const ResetPasswordPage = lazy(async () => {
  const module = await import('@/features/auth/pages/ResetPasswordPage')
  return { default: module.ResetPasswordPage }
})

function ResetPasswordRouteComponent() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <ResetPasswordPage />
    </Suspense>
  )
}

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordRouteComponent,
})
