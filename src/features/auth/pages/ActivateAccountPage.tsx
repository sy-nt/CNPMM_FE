import { Link, useNavigate } from '@tanstack/react-router'
import { BadgeCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAsyncAction } from '@/common/hooks/useAsyncAction'
import {
  activateAccountSchema,
  validateForm,
} from '@/features/auth/validation'
import { authApi } from '@/services/auth'
import { decodeOtpToken } from '@/utils/decode-otp-token'
import { AuthCard } from '@/components/auth/AuthCard'
import { FormField } from '@/components/auth/FormField'
import { StatusAlert } from '@/components/auth/StatusAlert'
import { Button } from '@ui/Button'

export function ActivateAccountPage() {
  const navigate = useNavigate()
  const activateAction = useAsyncAction(authApi.activateAccount)
  const [email, setEmail] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [otp, setOtp] = useState<string>('')
  const [isActivated, setIsActivated] = useState<boolean>(false)
  const hasAutoSubmitted = useRef<boolean>(false)

  async function activateAccount(
    nextEmail: string = email,
    nextOtp: string = otp,
  ): Promise<void> {
    const validationError = validateForm(activateAccountSchema, {
      email: nextEmail,
      otp: nextOtp,
    })
    if (validationError) {
      setFormError(validationError)
      return
    }

    const parsedOtp = Number(nextOtp)
    setFormError(null)

    await activateAction.run({
      email: nextEmail,
      otp: parsedOtp,
    })
    setIsActivated(true)
    await navigate({ to: '/login' })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    try {
      await activateAccount()
    } catch {
      return
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      const decodedToken = decodeOtpToken(token)

      if (!decodedToken) {
        setFormError('Invalid activation link.')
        return
      }

      setEmail(decodedToken.email)
      setOtp(decodedToken.otp)
      return
    }

    setEmail(params.get('email') ?? '')
    setOtp(params.get('otp') ?? '')
  }, [])

  useEffect(() => {
    if (hasAutoSubmitted.current || !email || !otp) return

    hasAutoSubmitted.current = true
    void activateAccount(email, otp).catch(() => undefined)
  }, [email, otp])

  return (
    <AppShell eyebrow="OTP bridge" title="Activate Account">
      <AuthCard eyebrow="Activation relay" title="Confirm your account link.">
        <div className="mb-8">
          <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper dark:bg-cream dark:text-ink">
            <BadgeCheck aria-hidden="true" size={20} />
          </div>
          <h1 className="mt-5 text-3xl font-black text-ink dark:text-paper">
            Activate Account
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
            Activation links can prefill email and OTP, then submit automatically.
            You can also retry manually.
          </p>
        </div>

        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <FormField
            autoComplete="email"
            label="Email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
          <FormField
            inputMode="numeric"
            label="OTP"
            name="otp"
            onChange={(event) => setOtp(event.target.value)}
            pattern="[0-9]*"
            placeholder="123456"
            required
            value={otp}
          />

          {formError ? <StatusAlert tone="danger">{formError}</StatusAlert> : null}
          {isActivated ? (
            <StatusAlert tone="success">
              Account activated. You can login now.
            </StatusAlert>
          ) : null}
          {activateAction.error ? (
            <StatusAlert tone="danger">{activateAction.error}</StatusAlert>
          ) : null}

          <Button className="mt-2" isLoading={activateAction.isLoading}>
            Activate account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/65 dark:text-paper/65">
          Activation done?{' '}
          <Link className="font-black text-copper hover:underline" to="/login">
            Go to login
          </Link>
        </p>
      </AuthCard>
    </AppShell>
  )
}
