import {
  USER_AVATAR_ALLOWED_EXTENSIONS,
  USER_AVATAR_IMAGE_PREFIX,
  USER_AVATAR_MAX_SIZE_BYTES,
} from '#/lib/api/image.constants'
import type { UserAvatarExtension } from '#/lib/api/image.constants'
import { createPresignedUrl } from '#/lib/api/image'
import { ApiError } from '#/lib/api/client'
import type { Maybe } from '#/lib/types'

const MIME_TO_EXTENSION: Record<string, UserAvatarExtension> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
}

export type AvatarFileValidationResult =
  | { ok: true; extension: UserAvatarExtension }
  | { ok: false; message: string }

export function validateUserAvatarFile(file: File): AvatarFileValidationResult {
  const extension = _inferExtension(file)
  if (!extension) {
    return {
      ok: false,
      message: 'Use a JPG or PNG image.',
    }
  }

  if (file.size > USER_AVATAR_MAX_SIZE_BYTES) {
    return {
      ok: false,
      message: 'Image must be 2 MB or smaller.',
    }
  }

  if (file.size <= 0) {
    return { ok: false, message: 'The selected file is empty.' }
  }

  return { ok: true, extension }
}

export async function uploadUserAvatar(
  file: File,
  accessToken: Maybe<string>,
  signal?: AbortSignal,
): Promise<string> {
  const validation = validateUserAvatarFile(file)
  if (!validation.ok) {
    throw new ApiError(validation.message, 0, { code: 'upload/invalid-file' })
  }

  const presigned = await createPresignedUrl(
    accessToken,
    {
      prefix: USER_AVATAR_IMAGE_PREFIX,
      extension: validation.extension,
      size: file.size,
    },
    signal,
  )

  const response = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': _signedContentType(validation.extension),
    },
    body: file,
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      await _readUploadErrorMessage(response),
      response.status,
      { code: 'upload/s3-failed' },
    )
  }

  return presigned.fileKey
}

function _signedContentType(extension: UserAvatarExtension): string {
  return `image/${extension}`
}

async function _readUploadErrorMessage(response: Response): Promise<string> {
  const body = await response.text().catch(() => '')
  if (body.length > 0 && body.length < 300 && !body.includes('<')) {
    return body
  }
  return 'Could not upload the image. Try again.'
}

function _inferExtension(file: File): UserAvatarExtension | null {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && _isAllowedExtension(fromName)) {
    return fromName
  }

  return MIME_TO_EXTENSION[file.type] ?? null
}

function _isAllowedExtension(value: string): value is UserAvatarExtension {
  return (USER_AVATAR_ALLOWED_EXTENSIONS as readonly string[]).includes(value)
}
