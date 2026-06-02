import { CheckCircle2 } from 'lucide-react'

import { Button } from '#/components/ui/button'

type ForgotPasswordSuccessProps = {
  email: string
  onTryAnother: () => void
}

export function ForgotPasswordSuccess({
  email,
  onTryAnother,
}: ForgotPasswordSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <CheckCircle2 aria-hidden="true" className="size-10 text-primary" />
      <p className="text-sm text-muted-foreground">
        If an account exists for{' '}
        <span className="font-medium text-foreground">{email}</span>, you will
        receive an email shortly with steps to reset your password.
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onTryAnother}
      >
        Use a different email
      </Button>
    </div>
  )
}
