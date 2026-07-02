import { createFileRoute } from '@tanstack/react-router'

import { ProfilePage } from '#/pages/me/profile-page'

export const Route = createFileRoute('/me/')({
  component: ProfilePage,
})
