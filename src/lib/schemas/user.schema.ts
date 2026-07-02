import { z } from 'zod'

const _trimmedName = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(64, 'At most 64 characters')

const _optionalImageKey = z
  .union([
    z.string().trim().min(1, 'Required').max(256, 'At most 256 characters'),
    z.literal(''),
  ])
  .optional()

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})
export type User = z.infer<typeof userSchema>

export const updateCurrentUserInputSchema = z.object({
  firstName: _trimmedName.optional(),
  lastName: _trimmedName.optional(),
  imageKey: z
    .string()
    .trim()
    .min(1, 'Required')
    .max(256, 'At most 256 characters')
    .optional(),
})
export type UpdateCurrentUserInput = z.infer<
  typeof updateCurrentUserInputSchema
>

export const blockUserInputSchema = z.object({
  email: z.email('Enter a valid email'),
})
export type BlockUserInput = z.infer<typeof blockUserInputSchema>

export const assignModeratorInputSchema = z.object({
  email: z.email('Enter a valid email'),
})
export type AssignModeratorInput = z.infer<typeof assignModeratorInputSchema>

export const updateProfileFormSchema = z.object({
  firstName: _trimmedName,
  lastName: _trimmedName,
  imageKey: _optionalImageKey,
})
export type UpdateProfileFormInput = z.infer<typeof updateProfileFormSchema>

export const adminUserSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})
export type AdminUserSummary = z.infer<typeof adminUserSummarySchema>

export const adminUserListResponseSchema = z
  .object({
    items: z.array(adminUserSummarySchema),
    hasNextPage: z.boolean(),
    lastId: z.string().optional(),
  })
  .catch(() => ({
    items: [],
    hasNextPage: false,
    lastId: undefined,
  }))
export type AdminUserListResponse = z.infer<typeof adminUserListResponseSchema>
