import { z } from 'zod'

import {
  STOREFRONT_LOCALE,
  STOREFRONT_TIME_ZONE,
} from '#/lib/datetime.constants'

const _HAS_OFFSET_SUFFIX = /(?:Z|[+-]\d{2}:\d{2})$/i

const _DEFAULT_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
}

/**
 * Parse an API datetime into UTC epoch milliseconds.
 * Offset-less strings are treated as UTC (backend contract).
 */
export function parseApiDateTime(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const withSeparator = trimmed.includes('T')
    ? trimmed
    : trimmed.replace(' ', 'T')
  const instant = _HAS_OFFSET_SUFFIX.test(withSeparator)
    ? withSeparator
    : `${withSeparator}Z`
  const ms = Date.parse(instant)
  return Number.isNaN(ms) ? null : ms
}

export const apiDateTimeStringSchema = z
  .string()
  .refine((value) => parseApiDateTime(value) !== null, {
    message: 'Invalid API datetime',
  })

export function formatDateTime(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = _DEFAULT_DATETIME_OPTIONS,
): string | null {
  if (!value) return null
  const ms = parseApiDateTime(value)
  if (ms === null) return null

  return new Intl.DateTimeFormat(STOREFRONT_LOCALE, {
    timeZone: STOREFRONT_TIME_ZONE,
    ...options,
  }).format(ms)
}

export function isWithinDurationMs(
  startValue: string,
  durationMs: number,
  nowMs: number = Date.now(),
): boolean {
  const startMs = parseApiDateTime(startValue)
  if (startMs === null) return false
  return nowMs - startMs < durationMs
}

export function getExpiresAtMs(
  startValue: string,
  durationMs: number,
): number | null {
  const startMs = parseApiDateTime(startValue)
  if (startMs === null) return null
  return startMs + durationMs
}
