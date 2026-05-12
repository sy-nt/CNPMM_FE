import * as yup from 'yup'

import { optionalUrlSchema } from '@/common/schema'

import { loginSchema } from '@/features/auth/validation/login'

export const signUpSchema = loginSchema.shape({
  firstName: yup.string().optional(),
  imageUrl: optionalUrlSchema,
  lastName: yup.string().optional(),
})
