import * as yup from 'yup'

import {
  optionalStrongPasswordSchema,
  optionalUrlSchema,
} from '@/common/schema'

export const profileSchema = yup.object({
  imageUrl: optionalUrlSchema,
})

export const passwordChangeSchema = yup.object({
  password: optionalStrongPasswordSchema.required('Password is required.'),
})
