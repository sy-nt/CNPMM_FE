export type DecodedActivationToken = {
  email: string
  otp: number
}

export function decodeActivationToken(
  token: string | undefined,
): DecodedActivationToken | null {
  if (!token) return null
  const decoded = _base64Decode(token)
  if (!decoded) return null
  const separator = decoded.indexOf(':')
  if (separator <= 0) return null
  const email = decoded.slice(0, separator).trim()
  const otpRaw = decoded.slice(separator + 1).trim()
  if (!email || !/^\d+$/.test(otpRaw)) return null
  const otp = Number(otpRaw)
  if (!Number.isSafeInteger(otp)) return null
  return { email, otp }
}

function _base64Decode(value: string): string | null {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob !== 'function') return null
  try {
    return atob(normalized)
  } catch {
    return null
  }
}
