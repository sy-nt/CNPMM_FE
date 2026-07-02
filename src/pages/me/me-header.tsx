import { ImageWithFallback } from '#/components/image-with-fallback'
import { resolveImageUrl } from '#/lib/images'
import type { User } from '#/lib/schemas/user.schema'

type MeHeaderProps = {
  user: User
}

export function MeHeader({ user }: MeHeaderProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ImageWithFallback
        src={resolveImageUrl(user.imageUrl)}
        alt={fullName}
        className="size-20 shrink-0 rounded-full border border-border"
      />
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Account
        </p>
        <h1 className="display-title text-3xl font-semibold text-foreground">
          {fullName}
        </h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </header>
  )
}
