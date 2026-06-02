import { useState } from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { AppShell } from '#/components/layout/app-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ApiError } from '#/lib/api/client'
import { invalidateCurrentUser, updateCurrentUser } from '#/lib/api/user'
import type { UpdateProfileFormInput } from '#/lib/schemas/user.schema'
import { AddressesSection } from '#/pages/me/addresses-section'
import { ProfileForm } from '#/pages/me/profile-form'
import { authStore, selectAccessToken } from '#/stores/auth.store'

const _routeApi = getRouteApi('/me')

export function MePage() {
  const { user, addresses } = _routeApi.useLoaderData()
  const router = useRouter()
  const accessToken = useStore(authStore, selectAccessToken)
  const [profileError, setProfileError] = useState<string | null>(null)

  const reload = (): Promise<void> => router.invalidate()

  const handleProfileSubmit = async (
    values: UpdateProfileFormInput,
  ): Promise<void> => {
    if (!accessToken) return
    setProfileError(null)
    try {
      await updateCurrentUser(accessToken, {
        firstName: values.firstName,
        lastName: values.lastName,
        imageUrl: values.imageUrl,
      })
      invalidateCurrentUser()
      toast.success('Profile updated.')
      await reload()
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not update your profile.'
      setProfileError(message)
      toast.error(message)
    }
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email

  return (
    <AppShell>
      <section className="rise-in space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ImageWithFallback
            src={user.imageUrl ?? null}
            alt={fullName}
            className="size-20 shrink-0 rounded-full border border-border"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Account
            </p>
            <h1 className="display-title text-3xl font-semibold text-foreground">
              {fullName}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update the information that appears on your account and orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialValues={{
                firstName: user.firstName ?? '',
                lastName: user.lastName ?? '',
                imageUrl: user.imageUrl ?? '',
              }}
              onSubmit={handleProfileSubmit}
              errorMessage={profileError}
            />
          </CardContent>
        </Card>

        {accessToken ? (
          <AddressesSection
            accessToken={accessToken}
            addresses={addresses}
            onChange={reload}
          />
        ) : null}
      </section>
    </AppShell>
  )
}
