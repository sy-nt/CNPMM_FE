import { Link, useNavigate } from '@tanstack/react-router'
import { LockKeyhole } from 'lucide-react'
import { useEffect } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useResetPasswordForm } from '@/features/auth/hooks/useResetPasswordForm'
import { AuthCard } from '@/components/auth/AuthCard'
import { PasswordField } from '@/components/auth/PasswordField'
import { StatusAlert } from '@/components/auth/StatusAlert'
import { Button } from '@ui/Button'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const {
    actionError,
    confirmPassword,
    formError,
    isLoading,
    isSubmitted,
    onSubmit,
    password,
    setConfirmPassword,
    setPassword,
  } = useResetPasswordForm()

  useEffect(() => {
    if (!isSubmitted) return
    void navigate({ to: '/login' })
  }, [isSubmitted, navigate])

  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-1.5rem)] place-items-center">
        <AuthCard eyebrow="Password vault" title="Set new password with OTP code.">
          <div className="mb-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper dark:bg-cream dark:text-ink">
              <LockKeyhole aria-hidden="true" size={20} />
            </div>
            <h1 className="mt-5 text-3xl font-black text-ink dark:text-paper">
              Reset Password
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
              Set your new password to finish account recovery.
            </p>
          </div>

          <form className="grid gap-4" noValidate onSubmit={onSubmit}>
            <PasswordField
              autoComplete="new-password"
              label="New password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password1!"
              required
              value={password}
            />
            <PasswordField
              autoComplete="new-password"
              label="Confirm new password"
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Password1!"
              required
              value={confirmPassword}
            />

            {formError ? <StatusAlert tone="danger">{formError}</StatusAlert> : null}
            {isSubmitted ? (
              <StatusAlert tone="success">
                Password reset success. Redirecting to login...
              </StatusAlert>
            ) : null}
            {actionError ? <StatusAlert tone="danger">{actionError}</StatusAlert> : null}

            <Button className="mt-2" isLoading={isLoading}>
              Reset password
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/65 dark:text-paper/65">
            Remember password?{' '}
            <Link className="font-black text-copper hover:underline" to="/login">
              Back to login
            </Link>
          </p>
        </AuthCard>
      </div>
    </AppShell>
  )
}
