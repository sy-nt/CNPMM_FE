import { apiRequest } from '#/lib/api/client'

export type CreatePresignedUrlInput = {
  prefix: string
  extension: string
  size: number
}

export type PresignedUrl = {
  url: string
  key: string
  expiresIn?: number
  headers?: Record<string, string>
}

export function createPresignedUrl(
  accessToken: string,
  input: CreatePresignedUrlInput,
  signal?: AbortSignal,
): Promise<PresignedUrl> {
  return apiRequest<PresignedUrl>('/image/presigned-url', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}
