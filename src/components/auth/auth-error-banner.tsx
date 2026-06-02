import { TriangleAlert } from 'lucide-react'

type AuthErrorBannerProps = {
  message: string
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
