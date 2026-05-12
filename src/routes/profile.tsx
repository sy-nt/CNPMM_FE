import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

import { requireAuth } from '@/features/auth/requireAuth'
import { RouteLoader } from '@/components/auth/RouteLoader'

const ProfilePage = lazy(async () => {
  const module = await import('@/features/auth/pages/ProfilePage')
  return { default: module.ProfilePage }
})

function ProfileRouteComponent() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <ProfilePage />
    </Suspense>
  )
}

export const Route = createFileRoute('/profile')({
  beforeLoad: requireAuth,
  component: ProfileRouteComponent,
})
