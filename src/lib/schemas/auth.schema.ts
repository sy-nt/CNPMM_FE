import { z } from 'zod'

const _emailSchema = z.email('Enter a valid email')
const _passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .max(128, 'At most 128 characters')

export const signUpSchema = z.object({
  email: _emailSchema,
  password: _passwordSchema,
  firstName: z.string().trim().min(1, 'Required').max(64, 'At most 64 characters'),
  lastName: z.string().trim().min(1, 'Required').max(64, 'At most 64 characters'),
  imageKey: z
    .union([
      z
        .string()
        .trim()
        .min(1, 'Required')
        .max(256, 'At most 256 characters'),
      z.literal(''),
    ])
    .optional(),
})
export type SignUpInput = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: _emailSchema,
  password: _passwordSchema,
})
export type SignInInput = z.infer<typeof signInSchema>

export const forgotPasswordSchema = z.object({
  email: _emailSchema,
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const activationOtpSchema = z.object({
  otp: z.string().trim().min(1, 'Required').regex(/^\d+$/, 'Digits only'),
})
export type ActivationOtpInput = z.infer<typeof activationOtpSchema>

export type ActivateAccountPayload = {
  email: string
  otp: number
}

export type ResetPasswordPayload = {
  email: string
  otp: number
  password: string
}
