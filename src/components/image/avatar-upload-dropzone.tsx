import { ImageUploadDropzone } from '#/components/image/image-upload-dropzone'
import { USER_AVATAR_ACCEPT } from '#/lib/api/image.constants'
import type { Maybe } from '#/lib/types'
import { uploadUserAvatar } from '#/lib/upload/user-avatar'

type AvatarUploadDropzoneProps = {
  accessToken?: Maybe<string>
  imageKey?: string | null
  /** Value restored when the user clicks Remove. */
  defaultImageKey?: string | null
  onImageKeyChange: (imageKey: string | undefined) => void
  label?: string
  description?: string
  error?: string | null
  disabled?: boolean
  className?: string
}

export function AvatarUploadDropzone({
  accessToken,
  imageKey,
  defaultImageKey,
  onImageKeyChange,
  label = 'Avatar',
  description = 'Drag and drop a JPG or PNG image, or click to browse. Max 2 MB.',
  error,
  disabled = false,
  className,
}: AvatarUploadDropzoneProps) {
  return (
    <ImageUploadDropzone
      accessToken={accessToken}
      imageKey={imageKey}
      defaultImageKey={defaultImageKey}
      onImageKeyChange={onImageKeyChange}
      upload={uploadUserAvatar}
      accept={USER_AVATAR_ACCEPT}
      label={label}
      description={description}
      resetLabel="Reset avatar"
      changeLabel="Change avatar image"
      error={error}
      disabled={disabled}
      className={className}
    />
  )
}
