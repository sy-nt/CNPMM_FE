import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { AuthCard } from '#/components/auth/auth-card'
import { useRedirectIfAuthenticated } from '#/hooks/use-redirect-if-authenticated'
import { getPostAuthRedirect } from '#/lib/auth-redirect'
import { signIn } from '#/lib/api/auth'
import { ApiError } from '#/lib/api/client'
import { getMyRole } from '#/lib/api/role'
import type { SignInInput } from '#/lib/schemas/auth.schema'
import { SignInForm } from '#/pages/auth/sign-in/sign-in-form'
import { setAuthTokens, setMyRole } from '#/stores/auth.store'

export function SignInPage() {
  const navigate = useNavigate()
  const isAuthenticated = useRedirectIfAuthenticated()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: SignInInput): Promise<void> => {
    setSubmitError(null)
    try {
      const tokens = await signIn(values)
      setAuthTokens(tokens)

      let roleName: string | undefined
      try {
        const myRole = await getMyRole(tokens.accessToken)
        setMyRole(myRole)
        roleName = myRole.name
      } catch (roleError) {
        console.error('Failed to load role/permissions', roleError)
        toast.warning('Signed in, but could not load your permissions.')
      }

      toast.success('Signed in successfully.')
      void navigate({
        to: getPostAuthRedirect(roleName),
      })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not sign you in. Try again.'
      setSubmitError(message)
      toast.error(message)
    }
  }

  if (isAuthenticated) return null

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue to your account."
      footer={
        <span>
          Don&apos;t have an account?{' '}
          <Link to="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </span>
      }
    >
      <SignInForm onSubmit={handleSubmit} errorMessage={submitError} />
    </AuthCard>
  )
}
