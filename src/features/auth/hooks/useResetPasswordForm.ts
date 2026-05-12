import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { useAsyncAction } from '@/common/hooks/useAsyncAction'
import { resetPasswordSchema, validateForm } from '@/features/auth/validation'
import { authApi } from '@/services/auth'
import { decodeOtpToken } from '@/utils/decode-otp-token'

type UseResetPasswordFormResult = {
  actionError: string | null
  confirmPassword: string
  formError: string | null
  isLoading: boolean
  isSubmitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  password: string
  setConfirmPassword: (value: string) => void
  setPassword: (value: string) => void
}

export function useResetPasswordForm(): UseResetPasswordFormResult {
  const resetPasswordAction = useAsyncAction(authApi.resetPassword)
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [otp, setOtp] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const hasPrefilled = useRef<boolean>(false)

  useEffect(() => {
    if (hasPrefilled.current) return

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      const decodedToken = decodeOtpToken(token)
      if (!decodedToken) {
        setFormError('Invalid reset link.')
        hasPrefilled.current = true
        return
      }

      setEmail(decodedToken.email)
      setOtp(decodedToken.otp)
      hasPrefilled.current = true
      return
    }

    const nextEmail = params.get('email') ?? ''
    const nextOtp = params.get('otp') ?? ''
    if (!nextEmail || !nextOtp) {
      setFormError('Invalid reset link.')
      hasPrefilled.current = true
      return
    }

    setEmail(nextEmail)
    setOtp(nextOtp)
    hasPrefilled.current = true
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const validationError = validateForm(resetPasswordSchema, {
      confirmPassword,
      email,
      otp,
      password,
    })

    if (validationError) {
      setFormError(validationError)
      setIsSubmitted(false)
      return
    }

    setFormError(null)

    try {
      await resetPasswordAction.run({
        email,
        otp: Number(otp),
        password,
      })
      setIsSubmitted(true)
      setConfirmPassword('')
      setPassword('')
    } catch {
      setIsSubmitted(false)
    }
  }

  return {
    actionError: resetPasswordAction.error,
    confirmPassword,
    formError,
    isLoading: resetPasswordAction.isLoading,
    isSubmitted,
    onSubmit,
    password,
    setConfirmPassword,
    setPassword,
  }
}
