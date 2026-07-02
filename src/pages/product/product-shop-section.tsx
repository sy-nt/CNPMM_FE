import { Link } from '@tanstack/react-router'
import { ChevronRight, Store } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { resolveImageUrl } from '#/lib/images'
import type { ShopPublicProfile } from '#/lib/schemas/shop.schema'

type ProductShopSectionProps = {
  shop: ShopPublicProfile
}

export function ProductShopSection({ shop }: ProductShopSectionProps) {
  const imageUrl =
    shop.imageUrl?.trim() || resolveImageUrl(shop.imageKey) || null

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Sold by
      </h2>

      <Link
        to="/shop/$slug"
        params={{ slug: shop.slug }}
        className="group flex items-start gap-4 rounded-lg no-underline transition-colors hover:bg-accent/50"
      >
        <ImageWithFallback
          src={imageUrl}
          alt=""
          className="size-16 shrink-0 rounded-lg"
          placeholder={
            <span
              aria-hidden="true"
              className="flex size-full items-center justify-center rounded-lg bg-muted text-muted-foreground"
            >
              <Store className="size-7" />
            </span>
          }
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1">
            <p className="text-base font-semibold text-foreground group-hover:text-primary">
              {shop.name}
            </p>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </div>
          {shop.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {shop.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">View shop</p>
          )}
        </div>
      </Link>
    </section>
  )
}
