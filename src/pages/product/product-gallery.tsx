import { useMemo } from 'react'
import { Package } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { resolveImageUrl } from '#/lib/images'
import type { ProductDetail, ProductSku } from '#/lib/schemas/product.schema'
import { cn } from '#/lib/utils'

export type GallerySelection = {
  imageKey: string
  /** Non-null when the entry is bound to a SKU's swatch image. */
  sku: ProductSku | null
}

type ProductGalleryProps = {
  product: ProductDetail
  activeImageKey: string | null
  onSelect: (selection: GallerySelection) => void
}

type GalleryEntry = {
  imageKey: string
  url: string | null
  sku: ProductSku | null
  label: string
}

export function ProductGallery({
  product,
  activeImageKey,
  onSelect,
}: ProductGalleryProps) {
  const entries = useMemo(() => _buildGallery(product), [product])
  const matchedEntry = entries.find(
    (entry) => entry.imageKey === activeImageKey,
  )
  const activeEntry: GalleryEntry | undefined =
    matchedEntry ?? (entries.length > 0 ? entries[0] : undefined)

  return (
    <div className="space-y-3">
      <ImageWithFallback
        src={activeEntry ? activeEntry.url : null}
        alt={product.name}
        className="aspect-square w-full rounded-2xl border border-border"
        placeholder={
          <Package
            aria-hidden="true"
            className="size-12 text-muted-foreground"
          />
        }
      />

      {entries.length > 1 ? (
        <ul aria-label="Product images" className="flex flex-wrap gap-2">
          {entries.map((entry) => {
            const isActive =
              activeEntry !== undefined &&
              activeEntry.imageKey === entry.imageKey
            return (
              <li key={entry.imageKey}>
                <button
                  type="button"
                  onClick={() =>
                    onSelect({ imageKey: entry.imageKey, sku: entry.sku })
                  }
                  aria-pressed={isActive}
                  aria-label={entry.label}
                  className={cn(
                    'rounded-lg border transition-colors',
                    isActive
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-border hover:border-foreground/40',
                  )}
                >
                  <ImageWithFallback
                    src={entry.url}
                    alt=""
                    className="size-16 rounded-lg"
                    placeholder={
                      <Package
                        aria-hidden="true"
                        className="size-5 text-muted-foreground"
                      />
                    }
                  />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

/**
 * Flattens main + every SKU image into a single deduped gallery list. Order
 * is: main first, then SKUs in their server order. Entries without an image
 * key are dropped — there's nothing to render. SKU rows that share an image
 * key with main (or with an earlier SKU) are deduped: clicking the dedup'd
 * thumb already changes the image, and the user can still pick that SKU
 * through the attribute chips.
 */
function _buildGallery(product: ProductDetail): ReadonlyArray<GalleryEntry> {
  const entries: GalleryEntry[] = []
  const seen = new Set<string>()

  if (product.mainImageKey) {
    entries.push({
      imageKey: product.mainImageKey,
      url: resolveImageUrl(product.mainImageKey),
      sku: null,
      label: `${product.name} — main image`,
    })
    seen.add(product.mainImageKey)
  }

  for (const sku of product.skus) {
    if (!sku.imageKey) continue
    if (seen.has(sku.imageKey)) continue
    entries.push({
      imageKey: sku.imageKey,
      url: resolveImageUrl(sku.imageKey),
      sku,
      label: sku.name ?? sku.skuCode,
    })
    seen.add(sku.imageKey)
  }

  return entries
}
