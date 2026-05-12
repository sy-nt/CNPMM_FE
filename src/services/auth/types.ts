export type LoginRequest = {
  email: string
  password: string
}

export type SignUpRequest = LoginRequest & {
  firstName?: string
  imageUrl?: string
  lastName?: string
}

export type ActivateAccountRequest = {
  email: string
  otp: number
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  email: string
  otp: number
  password: string
}
