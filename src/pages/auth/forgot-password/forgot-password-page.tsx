import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'

import { AuthCard } from '#/components/auth/auth-card'
import { forgotPassword } from '#/lib/api/auth'
import { ApiError } from '#/lib/api/client'
import type { ForgotPasswordInput } from '#/lib/schemas/auth.schema'
import { ForgotPasswordForm } from '#/pages/auth/forgot-password/forgot-password-form'
import { ForgotPasswordSuccess } from '#/pages/auth/forgot-password/forgot-password-success'

export function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sentToEmail, setSentToEmail] = useState<string | null>(null)

  const handleSubmit = async (values: ForgotPasswordInput): Promise<void> => {
    setSubmitError(null)
    try {
      await forgotPassword(values)
      setSentToEmail(values.email)
      toast.success('Password reset instructions sent.')
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not send the reset email. Try again.'
      setSubmitError(message)
      toast.error(message)
    }
  }

  const backToSignInLink = (
    <span>
      Remembered it?{' '}
      <Link to="/sign-in" className="font-medium text-primary hover:underline">
        Back to sign in
      </Link>
    </span>
  )

  if (sentToEmail) {
    return (
      <AuthCard
        title="Check your inbox"
        description="We sent instructions for resetting your password."
        footer={backToSignInLink}
      >
        <ForgotPasswordSuccess
          email={sentToEmail}
          onTryAnother={() => setSentToEmail(null)}
        />
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset code."
      footer={backToSignInLink}
    >
      <ForgotPasswordForm onSubmit={handleSubmit} errorMessage={submitError} />
    </AuthCard>
  )
}
