import { z } from 'zod'

const _trimmedName = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(64, 'At most 64 characters')

const _optionalImageUrl = z
  .union([z.url('Must be a valid URL'), z.literal('')])
  .optional()

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})
export type User = z.infer<typeof userSchema>

export const updateProfileFormSchema = z.object({
  firstName: _trimmedName,
  lastName: _trimmedName,
  imageUrl: _optionalImageUrl,
})
export type UpdateProfileFormInput = z.infer<typeof updateProfileFormSchema>
