import { z } from 'zod'

import { IMAGE_ALLOWED_EXTENSIONS } from '#/lib/api/image.constants'

export const imageExtensionSchema = z.enum(IMAGE_ALLOWED_EXTENSIONS)

export const createPresignedUrlInputSchema = z.object({
  prefix: z.string().trim().min(1),
  extension: imageExtensionSchema,
  size: z.number().int().positive(),
})
export type CreatePresignedUrlInput = z.infer<typeof createPresignedUrlInputSchema>

export const presignedUrlSchema = z.object({
  uploadUrl: z.string().url(),
  fileKey: z.string().min(1),
})
export type PresignedUrl = z.infer<typeof presignedUrlSchema>
