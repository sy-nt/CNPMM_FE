type FieldMetaLike = {
  isTouched?: boolean
  errors: ReadonlyArray<unknown>
}

export function getFieldError(meta: FieldMetaLike): string | null {
  if (!meta.isTouched) return null
  const first = meta.errors[0]
  if (first == null) return null
  if (typeof first === 'string') return first
  if (first instanceof Error) return first.message
  if (typeof first === 'object' && 'message' in first) {
    const { message } = first
    if (typeof message === 'string') return message
  }
  return String(first)
}
