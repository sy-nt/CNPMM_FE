import { useState } from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ApiError } from '#/lib/api/client'
import { userMutations } from '#/lib/query/user'
import type { UpdateProfileFormInput } from '#/lib/schemas/user.schema'
import { ProfileForm } from '#/pages/me/profile-form'
import { authStore, selectAccessToken } from '#/stores/auth.store'

const _meRoute = getRouteApi('/me')

export function ProfilePage() {
  const { user } = _meRoute.useLoaderData()
  const router = useRouter()
  const accessToken = useStore(authStore, selectAccessToken)
  const [profileError, setProfileError] = useState<string | null>(null)
  const updateProfile = useMutation(
    userMutations(accessToken ?? '').updateCurrent,
  )

  const handleProfileSubmit = async (
    values: UpdateProfileFormInput,
  ): Promise<void> => {
    if (!accessToken) return
    setProfileError(null)
    try {
      await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        imageKey: values.imageKey,
      })
      toast.success('Profile updated.')
      await router.invalidate()
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not update your profile.'
      setProfileError(message)
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update the information that appears on your account and orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm
          accessToken={accessToken}
          initialValues={{
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            imageKey: user.imageKey ?? '',
          }}
          onSubmit={handleProfileSubmit}
          errorMessage={profileError}
        />
      </CardContent>
    </Card>
  )
}
