import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

import { RouteLoader } from '@/components/auth/RouteLoader'

const LoginPage = lazy(async () => {
  const module = await import('@/features/auth/pages/LoginPage')
  return { default: module.LoginPage }
})

function LoginRouteComponent() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <LoginPage />
    </Suspense>
  )
}

export const Route = createFileRoute('/login')({ component: LoginRouteComponent })
