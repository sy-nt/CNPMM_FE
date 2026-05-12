import * as yup from 'yup'

import { emailSchema, otpCodeSchema, strongPasswordSchema } from '@/common/schema'

export const resetPasswordSchema = yup.object({
  confirmPassword: yup
    .string()
    .required('Confirm new password is required.')
    .oneOf([yup.ref('password')], 'Confirm new password must match new password.'),
  email: emailSchema,
  otp: otpCodeSchema,
  password: strongPasswordSchema,
})
