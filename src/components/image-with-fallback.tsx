import { useEffect, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { ImageOff } from 'lucide-react'

import { cn } from '#/lib/utils'

type ImageWithFallbackProps = Omit<ComponentProps<'img'>, 'src'> & {
  src?: string | null
  /** Rendered while the image is loading or when `src` is empty/null. */
  placeholder?: ReactNode
  /**
   * Rendered when the image fails to load. Defaults to the same node as
   * `placeholder`, since the user-visible affordance is the same.
   */
  fallback?: ReactNode
}

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

const _defaultPlaceholder: ReactNode = (
  <ImageOff aria-hidden="true" className="size-1/2 text-muted-foreground" />
)

/**
 * `<img>` wrapper with a built-in placeholder + error fallback. Use whenever a
 * remote URL may be missing or unreachable (category icons, product thumbs,
 * avatars). The wrapper preserves the consumer's `className` for sizing, so
 * callers control the box and we only handle the visual state inside it.
 */
export function ImageWithFallback({
  src,
  alt,
  placeholder = _defaultPlaceholder,
  fallback,
  className,
  onLoad,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [status, setStatus] = useState<ImageStatus>(src ? 'loading' : 'idle')

  useEffect(() => {
    setStatus(src ? 'loading' : 'idle')
  }, [src])

  const showImage = Boolean(src) && status !== 'error'
  const overlayNode =
    status === 'error' ? (fallback ?? placeholder) : placeholder

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground',
        className,
      )}
      aria-hidden={alt ? undefined : true}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={alt ?? ''}
          loading="lazy"
          decoding="async"
          className={cn(
            'h-full w-full object-cover transition-opacity duration-150',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={(event) => {
            setStatus('loaded')
            onLoad?.(event)
          }}
          onError={(event) => {
            setStatus('error')
            onError?.(event)
          }}
          {...props}
        />
      ) : null}

      {status !== 'loaded' ? (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          data-slot="image-fallback"
        >
          {overlayNode}
        </span>
      ) : null}
    </span>
  )
}
