import { Store } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { resolveImageUrl } from '#/lib/images'
import type { ShopPublicProfile } from '#/lib/schemas/shop.schema'

type ShopHeaderProps = {
  shop: ShopPublicProfile
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const imageUrl =
    shop.imageUrl?.trim() || resolveImageUrl(shop.imageKey) || null

  return (
    <header className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start">
      <ImageWithFallback
        src={imageUrl}
        alt=""
        className="size-24 shrink-0 rounded-xl sm:size-28"
        placeholder={
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center rounded-xl bg-muted text-muted-foreground"
          >
            <Store className="size-10" />
          </span>
        }
      />

      <div className="min-w-0 space-y-2">
        <h1 className="display-title text-2xl font-semibold text-foreground sm:text-3xl">
          {shop.name}
        </h1>
        {shop.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {shop.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Browse products from this shop.
          </p>
        )}
      </div>
    </header>
  )
}
