import { Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { AuthErrorBanner } from '#/components/auth/auth-error-banner'
import { AuthSubmitButton } from '#/components/auth/auth-submit-button'
import { TextField } from '#/components/auth/text-field'
import { getFieldError } from '#/lib/forms'
import type { SignInInput } from '#/lib/schemas/auth.schema'
import { signInSchema } from '#/lib/schemas/auth.schema'

type SignInFormProps = {
  onSubmit: (values: SignInInput) => Promise<void>
  errorMessage?: string | null
}

const _defaultValues: SignInInput = { email: '', password: '' }

export function SignInForm({ onSubmit, errorMessage }: SignInFormProps) {
  const form = useForm({
    defaultValues: _defaultValues,
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{ onChange: signInSchema.shape.email }}
      >
        {(field) => (
          <TextField
            id={field.name}
            name={field.name}
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="you@example.com"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={getFieldError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: signInSchema.shape.password }}
      >
        {(field) => (
          <div>
            <TextField
              id={field.name}
              name={field.name}
              type="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Your password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={getFieldError(field.state.meta)}
            />
            <div className="mt-1.5 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        )}
      </form.Field>

      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <AuthSubmitButton
            isSubmitting={isSubmitting}
            label="Sign in"
            pendingLabel="Signing in…"
          />
        )}
      </form.Subscribe>
    </form>
  )
}
