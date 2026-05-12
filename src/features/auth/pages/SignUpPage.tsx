import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAsyncAction } from '@/common/hooks/useAsyncAction'
import { signUpSchema, validateForm } from '@/features/auth/validation'
import { authApi } from '@/services/auth'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthModeSwitch } from '@/components/auth/AuthModeSwitch'
import { AvatarDropzone } from '@/components/auth/AvatarDropzone'
import { FormField } from '@/components/auth/FormField'
import { PasswordField } from '@/components/auth/PasswordField'
import { StatusAlert } from '@/components/auth/StatusAlert'
import { Button } from '@ui/Button'

const MOCK_AVATAR_URL = 'https://example.com/avatar.png'

export function SignUpPage() {
  const signUpAction = useAsyncAction(authApi.signUp)
  const [email, setEmail] = useState<string>('')
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false)
  const [lastName, setLastName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isCreated, setIsCreated] = useState<boolean>(false)

  async function handleAvatarFile(file: File): Promise<void> {
    setIsUploadingAvatar(true)
    setAvatarFileName(file.name)
    await Promise.resolve()
    setImageUrl(MOCK_AVATAR_URL)
    setIsUploadingAvatar(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const payload = {
      email,
      firstName: firstName || undefined,
      imageUrl: imageUrl || undefined,
      lastName: lastName || undefined,
      password,
    }
    const validationError = validateForm(signUpSchema, payload)

    if (validationError) {
      setFormError(validationError)
      setIsCreated(false)
      return
    }

    setFormError(null)

    try {
      await signUpAction.run(payload)
      setIsCreated(true)
    } catch {
      setIsCreated(false)
    }
  }

  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-1.5rem)] place-items-center">
        <AuthCard eyebrow="Account forge" title="Create a storefront identity.">
          <div className="mb-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper dark:bg-cream dark:text-ink">
              <Sparkles aria-hidden="true" size={20} />
            </div>
            <h1 className="mt-5 text-3xl font-black text-ink dark:text-paper">
              Sign Up
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
              Register, then open activation link sent by backend email service to
              unlock login.
            </p>
          </div>

          <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                autoComplete="given-name"
                label="First name"
                name="firstName"
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Test"
                value={firstName}
              />
              <FormField
                autoComplete="family-name"
                label="Last name"
                name="lastName"
                onChange={(event) => setLastName(event.target.value)}
                placeholder="User"
                value={lastName}
              />
            </div>
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
              autoComplete="new-password"
              label="Password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password1!"
              required
              value={password}
            />
            <AvatarDropzone
              fileName={avatarFileName}
              isUploading={isUploadingAvatar}
              onFile={(file) => {
                void handleAvatarFile(file)
              }}
            />

            {formError ? (
              <StatusAlert tone="danger">{formError}</StatusAlert>
            ) : null}
            {isCreated ? (
              <StatusAlert tone="success">
                Account created. Check your email for activation link before login.
              </StatusAlert>
            ) : null}
            {signUpAction.error ? (
              <StatusAlert tone="danger">{signUpAction.error}</StatusAlert>
            ) : null}

            <Button className="mt-2" isLoading={signUpAction.isLoading}>
              Create account
            </Button>
          </form>

          <AuthModeSwitch cta="Sign in" helper="Already active?" to="/login" />
        </AuthCard>
      </div>
    </AppShell>
  )
}
