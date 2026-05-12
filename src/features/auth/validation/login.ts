import * as yup from 'yup'

import { emailSchema, strongPasswordSchema } from '@/common/schema'

export const loginSchema = yup.object({
  email: emailSchema,
  password: strongPasswordSchema,
})
