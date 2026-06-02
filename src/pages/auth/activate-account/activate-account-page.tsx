import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { AuthCard } from '#/components/auth/auth-card'
import { AuthErrorBanner } from '#/components/auth/auth-error-banner'
import { useClientStore } from '#/hooks/use-client-store'
import { activateAccount } from '#/lib/api/auth'
import { ApiError } from '#/lib/api/client'
import type { ActivationOtpInput } from '#/lib/schemas/auth.schema'
import { ActivateAccountForm } from '#/pages/auth/activate-account/activate-account-form'
import { ActivatingState } from '#/pages/auth/activate-account/activating-state'
import { ActivationSuccess } from '#/pages/auth/activate-account/activation-success'
import { decodeActivationToken } from '#/pages/auth/activate-account/_decode-activation-token'
import {
  authStore,
  clearPendingActivationEmail,
  selectPendingActivationEmail,
  setPendingActivationEmail,
} from '#/stores/auth.store'

type ActivationStatus =
  | 'auto-submitting'
  | 'manual'
  | 'success'
  | 'redirecting'

const _routeApi = getRouteApi('/activate')

export function ActivateAccountPage() {
  const { token } = _routeApi.useSearch()
  const navigate = useNavigate()
  const storedEmail = useClientStore(
    authStore,
    selectPendingActivationEmail,
    null,
  )

  const decoded = useMemo(() => decodeActivationToken(token), [token])
  const email = decoded?.email ?? storedEmail

  const [status, setStatus] = useState<ActivationStatus>(() =>
    decoded ? 'auto-submitting' : 'manual',
  )
  const [autoError, setAutoError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const _autoFiredRef = useRef(false)

  useEffect(() => {
    if (!email || decoded) return
    setPendingActivationEmail(email)
  }, [email, decoded])

  useEffect(() => {
    if (!email && !decoded) {
      setStatus('redirecting')
      toast.error('Sign up first to receive an activation code.')
      void navigate({ to: '/sign-up' })
    }
  }, [email, decoded, navigate])

  useEffect(() => {
    if (!decoded || _autoFiredRef.current) return
    _autoFiredRef.current = true

    setPendingActivationEmail(decoded.email)
    const controller = new AbortController()

    activateAccount(decoded, controller.signal)
      .then(() => {
        clearPendingActivationEmail()
        setStatus('success')
        toast.success('Your account is now active. You can sign in.')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message =
          error instanceof ApiError
            ? error.message
            : 'Could not activate your account. Enter the code manually below.'
        setAutoError(message)
        setStatus('manual')
        toast.error(message)
      })

    return () => controller.abort()
  }, [decoded])

  const handleManualSubmit = async (
    values: ActivationOtpInput,
  ): Promise<void> => {
    if (!email) return
    setSubmitError(null)
    try {
      await activateAccount({ email, otp: Number(values.otp) })
      clearPendingActivationEmail()
      setStatus('success')
      toast.success('Your account is now active. You can sign in.')
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not activate your account. Try again.'
      setSubmitError(message)
      toast.error(message)
    }
  }

  if (status === 'auto-submitting') return <ActivatingState />
  if (status === 'success') return <ActivationSuccess />
  if (status === 'redirecting' || !email) return null

  return (
    <AuthCard
      title="Activate your account"
      description="Enter the code we emailed you to finish setting up your account."
      footer={
        <span>
          Wrong account?{' '}
          <Link to="/sign-up" className="font-medium text-primary hover:underline">
            Create a new one
          </Link>
        </span>
      }
    >
      <div className="space-y-4">
        {autoError ? <AuthErrorBanner message={autoError} /> : null}
        <ActivateAccountForm
          email={email}
          onSubmit={handleManualSubmit}
          errorMessage={submitError}
        />
      </div>
    </AuthCard>
  )
}
