import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

import { RouteLoader } from '@/components/auth/RouteLoader'

const SignUpPage = lazy(async () => {
  const module = await import('@/features/auth/pages/SignUpPage')
  return { default: module.SignUpPage }
})

function SignUpRouteComponent() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <SignUpPage />
    </Suspense>
  )
}

export const Route = createFileRoute('/sign-up')({ component: SignUpRouteComponent })
