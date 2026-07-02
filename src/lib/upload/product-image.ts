import {
  IMAGE_ALLOWED_EXTENSIONS,
  PRODUCT_IMAGE_MAX_SIZE_BYTES,
  PRODUCT_IMAGE_PREFIX,
} from '#/lib/api/image.constants'
import type { ImageExtension } from '#/lib/api/image.constants'
import { createShopPresignedUrl } from '#/lib/api/image'
import { ApiError } from '#/lib/api/client'

const MIME_TO_EXTENSION: Record<string, ImageExtension> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
}

export type ProductImageFileValidationResult =
  | { ok: true; extension: ImageExtension }
  | { ok: false; message: string }

export function validateProductImageFile(
  file: File,
): ProductImageFileValidationResult {
  const extension = _inferExtension(file)
  if (!extension) {
    return {
      ok: false,
      message: 'Use a JPG or PNG image.',
    }
  }

  if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
    return {
      ok: false,
      message: 'Image must be 5 MB or smaller.',
    }
  }

  if (file.size <= 0) {
    return { ok: false, message: 'The selected file is empty.' }
  }

  return { ok: true, extension }
}

export async function uploadProductImage(
  file: File,
  accessToken: string,
  signal?: AbortSignal,
): Promise<string> {
  const validation = validateProductImageFile(file)
  if (!validation.ok) {
    throw new ApiError(validation.message, 0, { code: 'upload/invalid-file' })
  }

  const presigned = await createShopPresignedUrl(
    accessToken,
    {
      prefix: PRODUCT_IMAGE_PREFIX,
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

function _signedContentType(extension: ImageExtension): string {
  return `image/${extension}`
}

async function _readUploadErrorMessage(response: Response): Promise<string> {
  const body = await response.text().catch(() => '')
  if (body.length > 0 && body.length < 300 && !body.includes('<')) {
    return body
  }
  return 'Could not upload the image. Try again.'
}

function _inferExtension(file: File): ImageExtension | null {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && _isAllowedExtension(fromName)) {
    return fromName
  }

  return MIME_TO_EXTENSION[file.type] ?? null
}

function _isAllowedExtension(value: string): value is ImageExtension {
  return (IMAGE_ALLOWED_EXTENSIONS as readonly string[]).includes(value)
}
