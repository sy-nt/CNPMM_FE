import * as yup from 'yup'

import { emailSchema } from '@/common/schema'

export const forgotPasswordSchema = yup.object({
  email: emailSchema,
})
