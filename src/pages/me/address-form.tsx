import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'

import { AuthErrorBanner } from '#/components/auth/auth-error-banner'
import { TextField } from '#/components/auth/text-field'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { getFieldError } from '#/lib/forms'
import { addressFormSchema } from '#/lib/schemas/address.schema'
import type { AddressFormInput } from '#/lib/schemas/address.schema'

type AddressFormProps = {
  formId: string
  initialValues: AddressFormInput
  submitLabel: string
  pendingLabel: string
  showCoordinates?: boolean
  onSubmit: (values: AddressFormInput) => Promise<void>
  onCancel: () => void
  errorMessage?: string | null
}

export const EMPTY_ADDRESS_FORM: AddressFormInput = {
  name: '',
  addressLine: '',
  city: '',
  district: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  isPrimary: false,
}

export function AddressForm({
  formId,
  initialValues,
  submitLabel,
  pendingLabel,
  showCoordinates = false,
  onSubmit,
  onCancel,
  errorMessage,
}: AddressFormProps) {
  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: addressFormSchema },
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
        name="name"
        validators={{ onChange: addressFormSchema.shape.name }}
      >
        {(field) => (
          <TextField
            id={`${field.name}-${formId}`}
            name={field.name}
            label="Label"
            placeholder="Home, Office…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={getFieldError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="addressLine"
        validators={{ onChange: addressFormSchema.shape.addressLine }}
      >
        {(field) => (
          <TextField
            id={`${field.name}-${formId}`}
            name={field.name}
            label="Street address"
            placeholder="123 Main Street"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={getFieldError(field.state.meta)}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field
          name="city"
          validators={{ onChange: addressFormSchema.shape.city }}
        >
          {(field) => (
            <TextField
              id={`${field.name}-${formId}`}
              name={field.name}
              label="City"
              placeholder="Ho Chi Minh"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={getFieldError(field.state.meta)}
            />
          )}
        </form.Field>
        <form.Field
          name="district"
          validators={{ onChange: addressFormSchema.shape.district }}
        >
          {(field) => (
            <TextField
              id={`${field.name}-${formId}`}
              name={field.name}
              label="District"
              placeholder="District 1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={getFieldError(field.state.meta)}
            />
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field
          name="state"
          validators={{ onChange: addressFormSchema.shape.state }}
        >
          {(field) => (
            <TextField
              id={`${field.name}-${formId}`}
              name={field.name}
              label="State / Province"
              placeholder="Ho Chi Minh"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={getFieldError(field.state.meta)}
            />
          )}
        </form.Field>
        <form.Field
          name="country"
          validators={{ onChange: addressFormSchema.shape.country }}
        >
          {(field) => (
            <TextField
              id={`${field.name}-${formId}`}
              name={field.name}
              label="Country"
              placeholder="Vietnam"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={getFieldError(field.state.meta)}
            />
          )}
        </form.Field>
      </div>

      {showCoordinates ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="latitude"
            validators={{ onChange: addressFormSchema.shape.latitude }}
          >
            {(field) => (
              <TextField
                id={`${field.name}-${formId}`}
                name={field.name}
                label="Latitude"
                placeholder="10.7626"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                error={getFieldError(field.state.meta)}
                description="Optional. Decimal degrees."
              />
            )}
          </form.Field>
          <form.Field
            name="longitude"
            validators={{ onChange: addressFormSchema.shape.longitude }}
          >
            {(field) => (
              <TextField
                id={`${field.name}-${formId}`}
                name={field.name}
                label="Longitude"
                placeholder="106.6602"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                error={getFieldError(field.state.meta)}
                description="Optional. Decimal degrees."
              />
            )}
          </form.Field>
        </div>
      ) : null}

      <form.Field name="isPrimary">
        {(field) => (
          <Label
            htmlFor={`${field.name}-${formId}`}
            className="flex items-center gap-2 text-sm font-normal text-muted-foreground"
          >
            <input
              id={`${field.name}-${formId}`}
              name={field.name}
              type="checkbox"
              className="size-4 rounded border-input accent-primary"
              checked={field.state.value}
              onChange={(event) => field.handleChange(event.target.checked)}
            />
            Set as primary address
          </Label>
        )}
      </form.Field>

      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  {pendingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
