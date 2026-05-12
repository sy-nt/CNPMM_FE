import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

import { RouteLoader } from '@/components/auth/RouteLoader'

const ActivateAccountPage = lazy(async () => {
  const module = await import('@/features/auth/pages/ActivateAccountPage')
  return { default: module.ActivateAccountPage }
})

function ActivateAccountRouteComponent() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <ActivateAccountPage />
    </Suspense>
  )
}

export const Route = createFileRoute('/activate-account')({
  component: ActivateAccountRouteComponent,
})
