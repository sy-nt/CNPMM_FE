import { ImageUploadDropzone } from '#/components/image/image-upload-dropzone'
import { PRODUCT_IMAGE_ACCEPT } from '#/lib/api/image.constants'
import type { Maybe } from '#/lib/types'
import { uploadProductImage } from '#/lib/upload/product-image'

type ProductImageUploadDropzoneProps = {
  accessToken?: Maybe<string>
  imageKey?: string | null
  defaultImageKey?: string | null
  onImageKeyChange: (imageKey: string | undefined) => void
  label?: string
  description?: string
  error?: string | null
  disabled?: boolean
  className?: string
}

export function ProductImageUploadDropzone({
  accessToken,
  imageKey,
  defaultImageKey,
  onImageKeyChange,
  label = 'Product image',
  description = 'Drag and drop a JPG or PNG image, or click to browse. Max 5 MB.',
  error,
  disabled = false,
  className,
}: ProductImageUploadDropzoneProps) {
  return (
    <ImageUploadDropzone
      accessToken={accessToken}
      imageKey={imageKey}
      defaultImageKey={defaultImageKey}
      onImageKeyChange={onImageKeyChange}
      upload={(file, token, signal) => {
        if (!token) {
          return Promise.reject(
            new Error('Sign in to upload a product image.'),
          )
        }
        return uploadProductImage(file, token, signal)
      }}
      accept={PRODUCT_IMAGE_ACCEPT}
      label={label}
      description={description}
      resetLabel="Reset image"
      changeLabel="Change product image"
      error={error}
      disabled={disabled}
      className={className}
    />
  )
}
