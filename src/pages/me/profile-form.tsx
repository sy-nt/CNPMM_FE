import { useForm } from '@tanstack/react-form'

import { AuthErrorBanner } from '#/components/auth/auth-error-banner'
import { AuthSubmitButton } from '#/components/auth/auth-submit-button'
import { TextField } from '#/components/auth/text-field'
import { AvatarUploadDropzone } from '#/components/image/avatar-upload-dropzone'
import { getFieldError } from '#/lib/forms'
import type { Maybe } from '#/lib/types'
import { updateProfileFormSchema } from '#/lib/schemas/user.schema'
import type { UpdateProfileFormInput } from '#/lib/schemas/user.schema'

type ProfileFormProps = {
  accessToken?: Maybe<string>
  initialValues: UpdateProfileFormInput
  onSubmit: (values: UpdateProfileFormInput) => Promise<void>
  errorMessage?: string | null
}

export function ProfileForm({
  accessToken,
  initialValues,
  onSubmit,
  errorMessage,
}: ProfileFormProps) {
  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: updateProfileFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        imageKey: value.imageKey?.trim() ? value.imageKey.trim() : undefined,
      })
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
          validators={{ onChange: updateProfileFormSchema.shape.firstName }}
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
          validators={{ onChange: updateProfileFormSchema.shape.lastName }}
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
        name="imageKey"
        validators={{ onChange: updateProfileFormSchema.shape.imageKey }}
      >
        {(field) => (
          <AvatarUploadDropzone
            accessToken={accessToken}
            imageKey={field.state.value}
            defaultImageKey={initialValues.imageKey}
            onImageKeyChange={(key) => field.handleChange(key ?? '')}
            error={getFieldError(field.state.meta)}
            description="Optional. Upload a new image or reset to your saved avatar."
          />
        )}
      </form.Field>

      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <AuthSubmitButton
            isSubmitting={isSubmitting}
            label="Save changes"
            pendingLabel="Saving…"
          />
        )}
      </form.Subscribe>
    </form>
  )
}
