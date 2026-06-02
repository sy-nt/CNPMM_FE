import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { AuthCard } from '#/components/auth/auth-card'
import { useRedirectIfAuthenticated } from '#/hooks/use-redirect-if-authenticated'
import { signUp } from '#/lib/api/auth'
import { ApiError } from '#/lib/api/client'
import type { SignUpInput } from '#/lib/schemas/auth.schema'
import { SignUpForm } from '#/pages/auth/sign-up/sign-up-form'
import { setPendingActivationEmail } from '#/stores/auth.store'

export function SignUpPage() {
  const navigate = useNavigate()
  const isAuthenticated = useRedirectIfAuthenticated()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: SignUpInput): Promise<void> => {
    setSubmitError(null)
    try {
      await signUp(values)
      setPendingActivationEmail(values.email)
      toast.success('Account created. Check your email for an activation code.')
      void navigate({ to: '/activate' })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not create your account. Try again.'
      setSubmitError(message)
      toast.error(message)
    }
  }

  if (isAuthenticated) return null

  return (
    <AuthCard
      title="Create your account"
      description="Join CNPM in less than a minute."
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <SignUpForm onSubmit={handleSubmit} errorMessage={submitError} />
    </AuthCard>
  )
}
