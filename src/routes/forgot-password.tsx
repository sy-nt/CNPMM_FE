import { createFileRoute } from '@tanstack/react-router'

import { ForgotPasswordPage } from '#/pages/auth/forgot-password/forgot-password-page'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})
