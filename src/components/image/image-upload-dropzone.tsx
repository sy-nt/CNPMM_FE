import { useEffect, useId, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { resolveImageUrl } from '#/lib/images'
import type { Maybe } from '#/lib/types'
import { cn } from '#/lib/utils'

type ImageUploadDropzoneProps = {
  accessToken?: Maybe<string>
  imageKey?: string | null
  /** Value restored when the user clicks Reset. */
  defaultImageKey?: string | null
  onImageKeyChange: (imageKey: string | undefined) => void
  upload: (
    file: File,
    accessToken: Maybe<string>,
    signal?: AbortSignal,
  ) => Promise<string>
  accept: string
  label?: string
  description?: string
  resetLabel?: string
  changeLabel?: string
  error?: string | null
  disabled?: boolean
  className?: string
}

export function ImageUploadDropzone({
  accessToken,
  imageKey,
  defaultImageKey,
  onImageKeyChange,
  upload,
  accept,
  label = 'Image',
  description = 'Drag and drop a JPG or PNG image, or click to browse. Max 2 MB.',
  resetLabel = 'Reset',
  changeLabel = 'Change image',
  error,
  disabled = false,
  className,
}: ImageUploadDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  const remotePreviewUrl = resolveImageUrl(imageKey)
  const previewUrl = localPreviewUrl ?? remotePreviewUrl
  const hasPreview = Boolean(previewUrl)
  const displayError = error ?? uploadError
  const isDisabled = disabled || isUploading

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  const _setLocalPreview = (file: File): void => {
    setLocalPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const _clearLocalPreview = (): void => {
    setLocalPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }

  const _uploadFile = async (file: File): Promise<void> => {
    setUploadError(null)
    setIsUploading(true)
    _setLocalPreview(file)

    try {
      const key = await upload(file, accessToken)
      onImageKeyChange(key)
    } catch (err) {
      _clearLocalPreview()
      const message =
        err instanceof ApiError
          ? err.message
          : 'Could not upload the image. Try again.'
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const _handleFiles = (files: FileList | null): void => {
    if (!files || files.length === 0 || isDisabled) return
    const file = files.item(0)
    if (!file) return
    void _uploadFile(file)
  }

  const _handleDragEnter = (): void => {
    if (isDisabled) return
    dragCounterRef.current += 1
    setIsDragging(true)
  }

  const _handleDragLeave = (): void => {
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }

  const _handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    if (!isDisabled) event.dataTransfer.dropEffect = 'copy'
  }

  const _handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
    _handleFiles(event.dataTransfer.files)
  }

  const _handleClear = (): void => {
    if (isDisabled) return
    _clearLocalPreview()
    setUploadError(null)
    const resetKey = defaultImageKey?.trim() ? defaultImageKey.trim() : undefined
    onImageKeyChange(resetKey)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor={inputId}>{label}</Label>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {hasPreview || imageKey ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDisabled}
            onClick={_handleClear}
            aria-label={resetLabel}
          >
            <X aria-hidden="true" />
            {resetLabel}
          </Button>
        ) : null}
      </div>

      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled || undefined}
        aria-label={hasPreview ? changeLabel : `Upload ${label.toLowerCase()}`}
        aria-describedby={displayError ? `${inputId}-error` : undefined}
        className={cn(
          'relative flex min-h-48 w-full overflow-hidden rounded-lg border-2 text-center transition-colors',
          hasPreview
            ? 'border-border bg-muted'
            : 'border-dashed border-border bg-muted/30',
          isDragging && 'border-primary bg-primary/5',
          !isDisabled && !hasPreview && 'hover:border-primary/60 hover:bg-muted/50',
          isDisabled && 'opacity-60',
        )}
        onClick={() => {
          if (!isDisabled) inputRef.current?.click()
        }}
        onKeyDown={(event) => {
          if (isDisabled) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={_handleDragEnter}
        onDragLeave={_handleDragLeave}
        onDragOver={_handleDragOver}
        onDrop={_handleDrop}
      >
        {hasPreview ? (
          <>
            <ImageWithFallback
              src={previewUrl}
              alt=""
              className="absolute inset-0 flex size-full rounded-[calc(var(--radius-lg)-2px)]"
            />
            <div
              className={cn(
                'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 px-4 opacity-0 transition-opacity',
                !isDisabled && 'hover:opacity-100',
                (isDragging || isUploading) && 'opacity-100',
              )}
            >
              {isUploading ? (
                <Loader2
                  aria-hidden="true"
                  className="size-8 animate-spin text-primary"
                />
              ) : (
                <ImagePlus
                  aria-hidden="true"
                  className="size-8 text-foreground"
                />
              )}
              <p className="text-sm font-medium text-foreground">
                {isUploading ? 'Uploading…' : 'Drop or click to replace'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex min-h-48 w-full flex-col items-center justify-center gap-2 px-4 py-6">
            {isUploading ? (
              <Loader2
                aria-hidden="true"
                className="size-8 animate-spin text-primary"
              />
            ) : (
              <ImagePlus
                aria-hidden="true"
                className="size-8 text-muted-foreground"
              />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isUploading ? 'Uploading…' : 'Drop image here'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isUploading ? 'Please wait' : 'or click to choose a file'}
              </p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={isDisabled}
          onChange={(event) => {
            _handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {displayError ? (
        <p id={`${inputId}-error`} className="text-xs text-destructive">
          {displayError}
        </p>
      ) : null}
    </div>
  )
}
