export type DecodedOtpToken = {
  email: string
  otp: string
}

export function decodeOtpToken(token: string): DecodedOtpToken | null {
  try {
    const decoded = window.atob(token.replaceAll(' ', '+'))
    const separatorIndex = decoded.lastIndexOf(':')

    if (separatorIndex <= 0) return null

    const email = decoded.slice(0, separatorIndex)
    const otp = decoded.slice(separatorIndex + 1)

    if (!email || !otp) return null

    return { email, otp }
  } catch {
    return null
  }
}
