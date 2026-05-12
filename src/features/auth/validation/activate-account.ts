import * as yup from 'yup'

import { emailSchema, otpCodeSchema } from '@/common/schema'

export const activateAccountSchema = yup.object({
  email: emailSchema,
  otp: otpCodeSchema,
})
