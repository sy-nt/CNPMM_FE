import { useState } from 'react'
import type { FormEvent } from 'react'

import { useAsyncAction } from '@/common/hooks/useAsyncAction'
import { forgotPasswordSchema, validateForm } from '@/features/auth/validation'
import { authApi } from '@/services/auth'

type ForgotPasswordValues = {
  email: string
}

type UseForgotPasswordFormResult = {
  actionError: string | null
  email: string
  formError: string | null
  isLoading: boolean
  isSubmitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  setEmail: (value: string) => void
}

export function useForgotPasswordForm(): UseForgotPasswordFormResult {
  const forgotPasswordAction = useAsyncAction(authApi.forgotPassword)
  const [email, setEmail] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const payload: ForgotPasswordValues = { email }
    const validationError = validateForm(forgotPasswordSchema, payload)

    if (validationError) {
      setFormError(validationError)
      setIsSubmitted(false)
      return
    }

    setFormError(null)

    try {
      await forgotPasswordAction.run(payload)
      setIsSubmitted(true)
    } catch {
      setIsSubmitted(false)
    }
  }

  return {
    actionError: forgotPasswordAction.error,
    email,
    formError,
    isLoading: forgotPasswordAction.isLoading,
    isSubmitted,
    onSubmit,
    setEmail,
  }
}
