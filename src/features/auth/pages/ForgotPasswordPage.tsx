import { Link } from '@tanstack/react-router'
import { KeyRound } from 'lucide-react'

import { AppShell } from '@/components/layout/AppShell'
import { useForgotPasswordForm } from '@/features/auth/hooks/useForgotPasswordForm'
import { AuthCard } from '@/components/auth/AuthCard'
import { FormField } from '@/components/auth/FormField'
import { StatusAlert } from '@/components/auth/StatusAlert'
import { Button } from '@ui/Button'

export function ForgotPasswordPage() {
  const { actionError, email, formError, isLoading, isSubmitted, onSubmit, setEmail } =
    useForgotPasswordForm()

  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-1.5rem)] place-items-center">
        <AuthCard eyebrow="Recovery relay" title="Get reset link for your account.">
          <div className="mb-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper dark:bg-cream dark:text-ink">
              <KeyRound aria-hidden="true" size={20} />
            </div>
            <h1 className="mt-5 text-3xl font-black text-ink dark:text-paper">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
              Send email to backend. You get OTP reset link if account exists.
            </p>
          </div>

          <form className="grid gap-4" noValidate onSubmit={onSubmit}>
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

            {formError ? <StatusAlert tone="danger">{formError}</StatusAlert> : null}
            {isSubmitted ? (
              <StatusAlert tone="success">
                Request sent. Check your email for reset link.
              </StatusAlert>
            ) : null}
            {actionError ? <StatusAlert tone="danger">{actionError}</StatusAlert> : null}

            <Button className="mt-2" isLoading={isLoading}>
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/65 dark:text-paper/65">
            Back to{' '}
            <Link className="font-black text-copper hover:underline" to="/login">
              Login
            </Link>
          </p>
        </AuthCard>
      </div>
    </AppShell>
  )
}
