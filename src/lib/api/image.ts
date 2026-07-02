import { apiRequest } from '#/lib/api/client'
import {
  createPresignedUrlInputSchema,
  presignedUrlSchema,
} from '#/lib/schemas/image.schema'
import type {
  CreatePresignedUrlInput,
  PresignedUrl,
} from '#/lib/schemas/image.schema'
import type { Maybe } from '#/lib/types'

export type { CreatePresignedUrlInput, PresignedUrl }

export function createPresignedUrl(
  accessToken: Maybe<string>,
  input: CreatePresignedUrlInput,
  signal?: AbortSignal,
): Promise<PresignedUrl> {
  const body = createPresignedUrlInputSchema.parse(input)
  return apiRequest<unknown>('/image/presigned-url', {
    method: 'POST',
    accessToken,
    body,
    signal,
  }).then((data) => presignedUrlSchema.parse(data))
}

export function createShopPresignedUrl(
  accessToken: string,
  input: CreatePresignedUrlInput,
  signal?: AbortSignal,
): Promise<PresignedUrl> {
  const body = createPresignedUrlInputSchema.parse(input)
  return apiRequest<unknown>('/shop/image/presigned-url', {
    method: 'POST',
    accessToken,
    body,
    signal,
  }).then((data) => presignedUrlSchema.parse(data))
}
