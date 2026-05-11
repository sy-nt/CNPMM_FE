import { UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { UserProfile } from '@/lib/api'

type ProfileAvatarProps = {
  user: UserProfile
}

export function ProfileAvatar({ user }: ProfileAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  const imageUrl = user.imageUrl ?? undefined
  const shouldShowImage = Boolean(imageUrl) && !hasImageError

  useEffect(() => {
    setHasImageError(false)
  }, [imageUrl])

  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 shadow-[0_16px_55px_rgb(57_48_40/0.12)] dark:border-paper/10 dark:bg-paper/5">
      <div className="flex items-center gap-4">
        <div className="grid size-20 place-items-center overflow-hidden rounded-3xl border border-ink/10 bg-cream dark:border-paper/10 dark:bg-paper/10">
          {shouldShowImage ? (
            <img
              alt={displayName}
              className="h-full w-full object-cover"
              onError={() => setHasImageError(true)}
              src={imageUrl}
            />
          ) : (
            <UserRound aria-hidden="true" className="text-ink dark:text-paper" />
          )}
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-copper">
            Active shopper
          </p>
          <h2 className="mt-1 text-2xl font-black text-ink dark:text-paper">
            {displayName}
          </h2>
          <p className="mt-1 text-sm text-ink/65 dark:text-paper/65">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  )
}
