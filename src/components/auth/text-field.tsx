import type { ComponentProps } from 'react'

import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { cn } from '#/lib/utils'

type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  id: string
  label: string
  description?: string
  error?: string | null
  containerClassName?: string
}

export function TextField({
  id,
  label,
  description,
  error,
  containerClassName,
  className,
  ...inputProps
}: TextFieldProps) {
  const hasError = Boolean(error)
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = hasError ? `${id}-error` : undefined

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId ?? descriptionId}
        className={className}
        {...inputProps}
      />
      {!hasError && description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
