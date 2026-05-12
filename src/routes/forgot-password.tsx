import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

import { RouteLoader } from '@/components/auth/RouteLoader'

const ForgotPasswordPage = lazy(async () => {
  const module = await import('@/features/auth/pages/ForgotPasswordPage')
  return { default: module.ForgotPasswordPage }
})

function ForgotPasswordRouteComponent() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <ForgotPasswordPage />
    </Suspense>
  )
}

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordRouteComponent,
})
