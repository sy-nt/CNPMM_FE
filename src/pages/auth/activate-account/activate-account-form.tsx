import { useForm } from '@tanstack/react-form'

import { AuthErrorBanner } from '#/components/auth/auth-error-banner'
import { AuthSubmitButton } from '#/components/auth/auth-submit-button'
import { TextField } from '#/components/auth/text-field'
import { getFieldError } from '#/lib/forms'
import type { ActivationOtpInput } from '#/lib/schemas/auth.schema'
import { activationOtpSchema } from '#/lib/schemas/auth.schema'

type ActivateAccountFormProps = {
  email: string
  onSubmit: (values: ActivationOtpInput) => Promise<void>
  errorMessage?: string | null
}

const _defaultValues: ActivationOtpInput = { otp: '' }

export function ActivateAccountForm({
  email,
  onSubmit,
  errorMessage,
}: ActivateAccountFormProps) {
  const form = useForm({
    defaultValues: _defaultValues,
    validators: { onSubmit: activationOtpSchema },
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
      <ActivationEmailNotice email={email} />

      <form.Field
        name="otp"
        validators={{ onChange: activationOtpSchema.shape.otp }}
      >
        {(field) => (
          <TextField
            id={field.name}
            name={field.name}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            label="Activation code"
            placeholder="Enter the code from your email"
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
            label="Activate account"
            pendingLabel="Activating…"
          />
        )}
      </form.Subscribe>
    </form>
  )
}

function ActivationEmailNotice({ email }: { email: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
      <span className="text-muted-foreground">Activating: </span>
      <span className="font-medium text-foreground">{email}</span>
    </div>
  )
}
