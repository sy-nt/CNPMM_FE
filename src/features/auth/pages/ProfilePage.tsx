import { useNavigate } from '@tanstack/react-router'
import { LogOut, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { useAsyncAction } from '@/common/hooks/useAsyncAction'
import { useAuth } from '@/features/auth/AuthProvider'
import { setUserState } from '@/features/auth/states/authSlice'
import {
  passwordChangeSchema,
  profileSchema,
  validateForm,
} from '@/features/auth/validation'
import { cn } from '@/lib/cn'
import { getApiErrorMessage } from '@/services/api-client'
import { authApi } from '@/services/auth'
import { userApi } from '@/services/user'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { FormField } from '@/components/auth/FormField'
import { PasswordField } from '@/components/auth/PasswordField'
import { ProfileAvatar } from '@/components/auth/ProfileAvatar'
import { StatusAlert } from '@/components/auth/StatusAlert'
import { Button } from '@ui/Button'

const profileSections = [
  { id: 'basic', label: 'Basic' },
  { id: 'password', label: 'Password' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'socials', label: 'Socials' },
] as const

type ProfileSectionId = (typeof profileSections)[number]['id']

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { clearSession, isAuthenticated, isReady } = useAuth()
  const updatePasswordAction = useAsyncAction(userApi.updateCurrentUser)
  const updateProfileAction = useAsyncAction(userApi.updateCurrentUser)
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null)
  const [profileFormError, setProfileFormError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('basic')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true)
  const [isPasswordSaved, setIsPasswordSaved] = useState<boolean>(false)
  const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)

  useEffect(() => {
    if (!isReady) return

    if (!isAuthenticated) {
      void navigate({ to: '/login' })
      return
    }

    async function loadUser(): Promise<void> {
      setIsLoadingUser(true)
      setLoadError(null)

      try {
        const response = await userApi.getCurrentUser()
        dispatch(setUserState(response.data))
        setFirstName(response.data.firstName ?? '')
        setImageUrl(response.data.imageUrl ?? '')
        setLastName(response.data.lastName ?? '')
      } catch (error) {
        setLoadError(getApiErrorMessage(error))
      } finally {
        setIsLoadingUser(false)
      }
    }

    void loadUser()
  }, [dispatch, isAuthenticated, isReady, navigate])

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const validationError = validateForm(profileSchema, {
      imageUrl: imageUrl || undefined,
    })

    if (validationError) {
      setProfileFormError(validationError)
      setIsProfileSaved(false)
      return
    }

    setProfileFormError(null)

    try {
      const response = await updateProfileAction.run({
        firstName: firstName || undefined,
        imageUrl: imageUrl || undefined,
        lastName: lastName || undefined,
      })
      dispatch(setUserState(response.data))
      setIsProfileSaved(true)
    } catch {
      setIsProfileSaved(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const validationError = validateForm(passwordChangeSchema, {
      password,
    })

    if (validationError) {
      setPasswordFormError(validationError)
      setIsPasswordSaved(false)
      return
    }

    setPasswordFormError(null)

    try {
      await updatePasswordAction.run({ password })
      setPassword('')
      setIsPasswordSaved(true)
    } catch {
      setIsPasswordSaved(false)
    }
  }

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true)

    try {
      await authApi.logout()
    } finally {
      clearSession()
      setIsLoggingOut(false)
      await navigate({ to: '/login' })
    }
  }

  return (
    <AppShell eyebrow="Account core" title="Profile">
      <section className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="grid content-start gap-4">
          {user ? (
            <ProfileAvatar user={user} />
          ) : (
            <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 text-ink/65 dark:border-paper/10 dark:bg-paper/5 dark:text-paper/65">
              Loading profile...
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 shadow-[0_24px_80px_rgb(57_48_40/0.14)] backdrop-blur sm:p-8 dark:border-paper/10 dark:bg-paper/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-ink dark:text-paper">
                Profile Settings
              </h1>
              <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
                Keep your shopper identity ready for account recovery and order
                workflows.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <p className="rounded-full border border-ink/10 bg-white/55 px-4 py-2 text-sm font-bold text-ink/70 dark:border-paper/10 dark:bg-paper/10 dark:text-paper/70">
                {user?.email ?? 'Loading email...'}
              </p>
              <Button
                isLoading={isLoggingOut}
                onClick={handleLogout}
                type="button"
                variant="secondary"
              >
                <LogOut aria-hidden="true" size={17} />
                Logout
              </Button>
            </div>
          </div>

          {loadError ? (
            <div className="mt-6">
              <StatusAlert tone="danger">{loadError}</StatusAlert>
            </div>
          ) : null}

          <div
            aria-label="Profile settings sections"
            className="mt-8 flex gap-1 overflow-x-auto border-b border-ink/10 dark:border-paper/10"
            role="tablist"
          >
            {profileSections.map((section) => (
              <button
                aria-controls={`profile-panel-${section.id}`}
                aria-selected={activeSection === section.id}
                className={cn(
                  'relative min-h-12 cursor-pointer px-5 text-sm font-black uppercase tracking-[0.08em] text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink dark:text-paper/55 dark:hover:bg-paper/10 dark:hover:text-paper',
                  activeSection === section.id &&
                    'text-copper after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-copper dark:text-cream dark:after:bg-cream',
                )}
                id={`profile-tab-${section.id}`}
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                role="tab"
                type="button"
              >
                {section.label}
              </button>
            ))}
          </div>

          {activeSection === 'basic' ? (
            <form
              aria-labelledby="profile-tab-basic"
              className="mt-8 grid gap-4"
              id="profile-panel-basic"
              noValidate
              onSubmit={handleProfileSubmit}
              role="tabpanel"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  autoComplete="given-name"
                  disabled={isLoadingUser}
                  label="First name"
                  name="firstName"
                  onChange={(event) => setFirstName(event.target.value)}
                  value={firstName}
                />
                <FormField
                  autoComplete="family-name"
                  disabled={isLoadingUser}
                  label="Last name"
                  name="lastName"
                  onChange={(event) => setLastName(event.target.value)}
                  value={lastName}
                />
              </div>
              <FormField
                disabled={isLoadingUser}
                label="Avatar URL"
                name="imageUrl"
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/avatar.png"
                type="url"
                value={imageUrl}
              />

              {profileFormError ? (
                <StatusAlert tone="danger">{profileFormError}</StatusAlert>
              ) : null}
              {isProfileSaved ? (
                <StatusAlert tone="success">Profile updated.</StatusAlert>
              ) : null}
              {updateProfileAction.error ? (
                <StatusAlert tone="danger">{updateProfileAction.error}</StatusAlert>
              ) : null}

              <Button
                className="mt-2"
                disabled={isLoadingUser || Boolean(loadError)}
                isLoading={updateProfileAction.isLoading}
              >
                <Save aria-hidden="true" size={17} />
                Save profile
              </Button>
            </form>
          ) : null}

          {activeSection === 'password' ? (
            <section
              aria-labelledby="profile-tab-password"
              className="mt-8"
              id="profile-panel-password"
              role="tabpanel"
            >
              <h2 className="text-2xl font-black text-ink dark:text-paper">
                Change Password
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
                Update your password separately from public profile details.
              </p>

              <form className="mt-5 grid gap-4" noValidate onSubmit={handlePasswordSubmit}>
                <PasswordField
                  autoComplete="new-password"
                  disabled={isLoadingUser}
                  label="New password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password1!"
                  required
                  value={password}
                />

                {passwordFormError ? (
                  <StatusAlert tone="danger">{passwordFormError}</StatusAlert>
                ) : null}
                {isPasswordSaved ? (
                  <StatusAlert tone="success">Password updated.</StatusAlert>
                ) : null}
                {updatePasswordAction.error ? (
                  <StatusAlert tone="danger">{updatePasswordAction.error}</StatusAlert>
                ) : null}

                <Button
                  className="mt-2"
                  disabled={isLoadingUser || Boolean(loadError)}
                  isLoading={updatePasswordAction.isLoading}
                >
                  <Save aria-hidden="true" size={17} />
                  Save password
                </Button>
              </form>
            </section>
          ) : null}

          {activeSection === 'addresses' ? (
            <section
              aria-labelledby="profile-tab-addresses"
              className="mt-8 rounded-3xl border border-ink/10 bg-white/45 p-6 dark:border-paper/10 dark:bg-paper/5"
              id="profile-panel-addresses"
              role="tabpanel"
            >
              <h2 className="text-2xl font-black text-ink dark:text-paper">
                Addresses
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
                Address management will live here when backend exposes shipping or
                billing address endpoints.
              </p>
            </section>
          ) : null}

          {activeSection === 'socials' ? (
            <section
              aria-labelledby="profile-tab-socials"
              className="mt-8 rounded-3xl border border-ink/10 bg-white/45 p-6 dark:border-paper/10 dark:bg-paper/5"
              id="profile-panel-socials"
              role="tabpanel"
            >
              <h2 className="text-2xl font-black text-ink dark:text-paper">
                Socials
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-paper/65">
                Social profile links will live here when those fields are added to
                user API.
              </p>
            </section>
          ) : null}
        </div>
      </section>
    </AppShell>
  )
}
