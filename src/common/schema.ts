import * as yup from 'yup'

export const emailSchema = yup
  .string()
  .required('Email is required.')
  .email('Enter a valid email address.')

export const otpCodeSchema = yup
  .string()
  .required('OTP is required.')
  .length(6, 'OTP must be a 6-digit number.')
  .matches(/^\d+$/, 'OTP must be a 6-digit number.')

export const strongPasswordSchema = yup
  .string()
  .required('Password is required.')
  .min(8, 'Password needs at least 8 characters.')
  .matches(/[a-z]/, 'Password needs a lowercase letter.')
  .matches(/[A-Z]/, 'Password needs an uppercase letter.')
  .matches(/\d/, 'Password needs a number.')
  .matches(/[@$!%*?&]/, 'Password needs a special character.')

export const optionalStrongPasswordSchema = yup
  .string()
  .test('optional-strong-password', 'Password is not strong enough.', (value) => {
    if (!value) return true
    return strongPasswordSchema.isValidSync(value)
  })

export const optionalUrlSchema = yup
  .string()
  .url('Avatar URL must be a valid URL.')
  .optional()

export function validateForm<TValues>(
  schema: yup.Schema<TValues>,
  values: TValues,
) {
  try {
    schema.validateSync(values, {
      abortEarly: true,
    })
    return null
  } catch (error) {
    if (error instanceof yup.ValidationError) return error.message
    return 'Invalid form data.'
  }
}
