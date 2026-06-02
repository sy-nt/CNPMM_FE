import { createFileRoute } from '@tanstack/react-router'

import { ensureAnonymous } from '#/lib/auth-guards'
import { SignInPage } from '#/pages/auth/sign-in/sign-in-page'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: ensureAnonymous,
  component: SignInPage,
})
