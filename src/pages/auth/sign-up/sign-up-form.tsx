import { useForm } from '@tanstack/react-form'

import { AuthErrorBanner } from '#/components/auth/auth-error-banner'
import { AuthSubmitButton } from '#/components/auth/auth-submit-button'
import { TextField } from '#/components/auth/text-field'
import { getFieldError } from '#/lib/forms'
import type { SignUpInput } from '#/lib/schemas/auth.schema'
import { signUpSchema } from '#/lib/schemas/auth.schema'

type SignUpFormProps = {
  onSubmit: (values: SignUpInput) => Promise<void>
  errorMessage?: string | null
}

const _defaultValues: SignUpInput = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  imageUrl: '',
}

export function SignUpForm({ onSubmit, errorMessage }: SignUpFormProps) {
  const form = useForm({
    defaultValues: _defaultValues,
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      const payload: SignUpInput = {
        ...value,
        imageUrl: value.imageUrl?.trim() ? value.imageUrl.trim() : undefined,
      }
      await onSubmit(payload)
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field
          name="firstName"
          validators={{ onChange: signUpSchema.shape.firstName }}
        >
          {(field) => (
            <TextField
              id={field.name}
              name={field.name}
              label="First name"
              autoComplete="given-name"
              placeholder="Jane"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={getFieldError(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field
          name="lastName"
          validators={{ onChange: signUpSchema.shape.lastName }}
        >
          {(field) => (
            <TextField
              id={field.name}
              name={field.name}
              label="Last name"
              autoComplete="family-name"
              placeholder="Doe"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={getFieldError(field.state.meta)}
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="email"
        validators={{ onChange: signUpSchema.shape.email }}
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
        validators={{ onChange: signUpSchema.shape.password }}
      >
        {(field) => (
          <TextField
            id={field.name}
            name={field.name}
            type="password"
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={getFieldError(field.state.meta)}
            description="Use 8 or more characters, mixing letters, numbers, and symbols."
          />
        )}
      </form.Field>

      <form.Field
        name="imageUrl"
        validators={{ onChange: signUpSchema.shape.imageUrl }}
      >
        {(field) => (
          <TextField
            id={field.name}
            name={field.name}
            type="url"
            label="Avatar URL"
            autoComplete="off"
            placeholder="https://example.com/avatar.png"
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={getFieldError(field.state.meta)}
            description="Optional."
          />
        )}
      </form.Field>

      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <AuthSubmitButton
            isSubmitting={isSubmitting}
            label="Create account"
            pendingLabel="Creating account…"
          />
        )}
      </form.Subscribe>
    </form>
  )
}
