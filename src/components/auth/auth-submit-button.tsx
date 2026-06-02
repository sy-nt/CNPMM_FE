import { Loader2 } from 'lucide-react'

import { Button } from '#/components/ui/button'

type AuthSubmitButtonProps = {
  isSubmitting: boolean
  label: string
  pendingLabel: string
}

export function AuthSubmitButton({
  isSubmitting,
  label,
  pendingLabel,
}: AuthSubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  )
}
