import { Loader2 } from 'lucide-react'

import { AuthCard } from '#/components/auth/auth-card'

export function ActivatingState() {
  return (
    <AuthCard
      title="Activating your account"
      description="Hang tight, this only takes a moment."
    >
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <Loader2
          aria-hidden="true"
          className="size-10 animate-spin text-primary"
        />
        <p className="text-sm text-muted-foreground">
          Submitting your activation code…
        </p>
      </div>
    </AuthCard>
  )
}
