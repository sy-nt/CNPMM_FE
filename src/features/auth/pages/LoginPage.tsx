import { Link, useNavigate } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAsyncAction } from '@/common/hooks/useAsyncAction'
import { useAuth } from '@/features/auth/AuthProvider'
import { loginSchema, validateForm } from '@/features/auth/validation'
import { authApi } from '@/services/auth'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthModeSwitch } from '@/components/auth/AuthModeSwitch'
import { FormField } from '@/components/auth/FormField'
import { PasswordField } from '@/components/auth/PasswordField'
import { StatusAlert } from '@/components/auth/StatusAlert'
import { Button } from '@ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const loginAction = useAsyncAction(authApi.login)
  const [email, setEmail] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [password, setPassword] = useState<string>('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const payload = { email, password }
    const validationError = validateForm(loginSchema, payload)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)

    try {
      const response = await loginAction.run(payload)
      setSession(response.data)
      await navigate({ to: '/profile' })
    } catch {
      return
    }
  }

  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-1.5rem)] place-items-center">
        <AuthCard eyebrow="Token terminal" title="Step into your buyer console.">
          <div className="mb-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper dark:bg-cream dark:text-ink">
              <Mail aria-hidden="true" size={20} />
            </div>
            <h1 className="mt-5 text-3xl font-black text-ink dark:text-paper">
              Login
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
              Use your activated account to unlock profile and checkout identity
              tools.
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
            <PasswordField
              autoComplete="current-password"
              label="Password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password1!"
              required
              value={password}
            />

            {formError ? (
              <StatusAlert tone="danger">{formError}</StatusAlert>
            ) : null}
            {loginAction.error ? (
              <StatusAlert tone="danger">{loginAction.error}</StatusAlert>
            ) : null}

            <Button className="mt-2" isLoading={loginAction.isLoading}>
              Login
            </Button>
          </form>

          <p className="mt-4 text-right text-sm text-ink/65 dark:text-paper/65">
            <Link className="font-black text-copper hover:underline" to="/forgot-password">
              Forgot password?
            </Link>
          </p>

          <AuthModeSwitch
            cta="Create account"
            helper="No account yet?"
            to="/sign-up"
          />
        </AuthCard>
      </div>
    </AppShell>
  )
}
