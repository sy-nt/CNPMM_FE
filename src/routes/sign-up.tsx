import { createFileRoute } from '@tanstack/react-router'

import { ensureAnonymous } from '#/lib/auth-guards'
import { SignUpPage } from '#/pages/auth/sign-up/sign-up-page'

export const Route = createFileRoute('/sign-up')({
  beforeLoad: ensureAnonymous,
  component: SignUpPage,
})
