import { useForm } from '@tanstack/react-form'

import { AuthErrorBanner } from '#/components/auth/auth-error-banner'
import { AuthSubmitButton } from '#/components/auth/auth-submit-button'
import { TextField } from '#/components/auth/text-field'
import { getFieldError } from '#/lib/forms'
import type { ForgotPasswordInput } from '#/lib/schemas/auth.schema'
import { forgotPasswordSchema } from '#/lib/schemas/auth.schema'

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordInput) => Promise<void>
  errorMessage?: string | null
}

const _defaultValues: ForgotPasswordInput = { email: '' }

export function ForgotPasswordForm({
  onSubmit,
  errorMessage,
}: ForgotPasswordFormProps) {
  const form = useForm({
    defaultValues: _defaultValues,
    validators: { onSubmit: forgotPasswordSchema },
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
        validators={{ onChange: forgotPasswordSchema.shape.email }}
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

      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <AuthSubmitButton
            isSubmitting={isSubmitting}
            label="Send reset instructions"
            pendingLabel="Sending…"
          />
        )}
      </form.Subscribe>
    </form>
  )
}
