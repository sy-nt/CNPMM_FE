import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function stableJsonKey(value: Record<string, unknown>): string {
  const sortedKeys = Object.keys(value).sort()
  const compact: Record<string, unknown> = {}
  for (const key of sortedKeys) {
    const entry = value[key]
    if (entry === undefined || entry === null) continue
    compact[key] = entry
  }
  return JSON.stringify(compact)
}
