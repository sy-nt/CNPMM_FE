import { Link } from '@tanstack/react-router'
import { Package } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { formatPrice } from '#/lib/format'
import { resolveImageUrl } from '#/lib/images'
import type { ProductSummary } from '#/lib/schemas/product.schema'

type ProductCardProps = {
  product: ProductSummary
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = resolveImageUrl(product.mainImageKey)
  const formattedPrice = formatPrice(product.price) as string

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="feature-card flex h-full flex-col gap-3 rounded-xl border border-border p-3 text-foreground no-underline transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <ImageWithFallback
        src={imageUrl}
        alt=""
        className="aspect-square w-full rounded-lg"
        placeholder={
          <Package
            aria-hidden="true"
            className="size-8 text-muted-foreground"
          />
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {product.name}
        </p>
        <div className="flex items-center gap-1 w-full justify-between">
          <p className="text-sm font-semibold text-primary">{formattedPrice}</p>
          <p className="text-sm text-muted-foreground">
            {product.soldCount} sold
          </p>
        </div>
      </div>
    </Link >
  )
}
