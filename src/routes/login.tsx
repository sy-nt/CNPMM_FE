import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { AuthCard } from '@/components/ui/AuthCard'
import { AuthModeSwitch } from '@/components/ui/AuthModeSwitch'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { PasswordField } from '@/components/ui/PasswordField'
import { StatusAlert } from '@/components/ui/StatusAlert'
import { useAuth } from '@/features/auth/AuthProvider'
import { useAsyncAction } from '@/features/auth/useAsyncAction'
import { loginSchema, validateForm } from '@/features/auth/validation'
import { authApi } from '@/lib/api'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const loginAction = useAsyncAction(authApi.login)
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
