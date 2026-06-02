import type { Maybe } from '#/lib/types'

const PUBLIC_BASE_URL = (
  import.meta.env.VITE_S3_PUBLIC_BASE_URL as Maybe<string>
)?.replace(/\/+$/, '')

export function resolveImageUrl(key: Maybe<string>): string | null {
  if (!key) return null
  if (/^https?:\/\//i.test(key)) return key
  if (!PUBLIC_BASE_URL) return null
  const trimmedKey = key.replace(/^\/+/, '')
  return `${PUBLIC_BASE_URL}/${trimmedKey}`
}
