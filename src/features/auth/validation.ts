import * as yup from 'yup'

const strongPassword = yup
  .string()
  .required('Password is required.')
  .min(8, 'Password needs at least 8 characters.')
  .matches(/[a-z]/, 'Password needs a lowercase letter.')
  .matches(/[A-Z]/, 'Password needs an uppercase letter.')
  .matches(/\d/, 'Password needs a number.')
  .matches(/[@$!%*?&]/, 'Password needs a special character.')

const optionalPassword = yup
  .string()
  .test('optional-strong-password', 'Password is not strong enough.', (value) => {
    if (!value) return true
    return strongPassword.isValidSync(value)
  })

const optionalUrl = yup
  .string()
  .url('Avatar URL must be a valid URL.')
  .optional()

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required.')
    .email('Enter a valid email address.'),
  password: strongPassword,
})

export const signUpSchema = loginSchema.shape({
  firstName: yup.string().optional(),
  imageUrl: optionalUrl,
  lastName: yup.string().optional(),
})

export const activateAccountSchema = yup.object({
  email: yup
    .string()
    .required('Email is required.')
    .email('Enter a valid email address.'),
  otp: yup
    .string()
    .required('OTP is required.')
    .length(6, 'OTP must be a 6-digit number.')
    .matches(/^\d+$/, 'OTP must be a 6-digit number.'),
})

export const profileSchema = yup.object({
  imageUrl: optionalUrl,
})

export const passwordChangeSchema = yup.object({
  password: optionalPassword.required('Password is required.'),
})

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
