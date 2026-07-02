import { ImageUploadDropzone } from '#/components/image/image-upload-dropzone'
import { SHOP_LOGO_ACCEPT } from '#/lib/api/image.constants'
import type { Maybe } from '#/lib/types'
import { uploadShopLogo } from '#/lib/upload/shop-logo'

type ShopLogoUploadDropzoneProps = {
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

export function ShopLogoUploadDropzone({
  accessToken,
  imageKey,
  defaultImageKey,
  onImageKeyChange,
  label = 'Shop logo',
  description = 'Drag and drop a JPG or PNG image, or click to browse. Max 2 MB.',
  error,
  disabled = false,
  className,
}: ShopLogoUploadDropzoneProps) {
  return (
    <ImageUploadDropzone
      accessToken={accessToken}
      imageKey={imageKey}
      defaultImageKey={defaultImageKey}
      onImageKeyChange={onImageKeyChange}
      upload={(file, token, signal) => {
        if (!token) {
          return Promise.reject(
            new Error('Sign in to upload a shop logo.'),
          )
        }
        return uploadShopLogo(file, token, signal)
      }}
      accept={SHOP_LOGO_ACCEPT}
      label={label}
      description={description}
      resetLabel="Reset logo"
      changeLabel="Change shop logo"
      error={error}
      disabled={disabled}
      className={className}
    />
  )
}
