import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'

import { AuthCard } from '#/components/auth/auth-card'
import { Button } from '#/components/ui/button'

export function ActivationSuccess() {
  return (
    <AuthCard
      title="Account activated"
      description="Welcome aboard. Sign in to start using your account."
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <CheckCircle2 aria-hidden="true" className="size-10 text-primary" />
        <Button asChild className="w-full">
          <Link to="/sign-in">Continue to sign in</Link>
        </Button>
      </div>
    </AuthCard>
  )
}
