import type { ReactNode } from 'react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { formatDateTime } from '#/lib/datetime'
import { resolveImageUrl } from '#/lib/images'
import type { InventoryRow } from '#/lib/schemas/inventory.schema'

export function inventoryRowImageUrl(row: InventoryRow): string | null {
  return (
    row.sku?.imageUrl ??
    row.product?.imageUrl ??
    resolveImageUrl(row.sku?.imageKey ?? row.product?.mainImageKey ?? null)
  )
}

export function inventoryAvailableQuantity(row: InventoryRow): number {
  return Math.max(0, row.quantity - row.reservedQuantity)
}

export function InventoryRowThumbnail({
  row,
}: {
  row: InventoryRow
}): ReactNode {
  const imageUrl = inventoryRowImageUrl(row)

  return (
    <ImageWithFallback
      src={imageUrl}
      alt=""
      className="size-10 rounded-md border border-border object-cover"
    />
  )
}

export function formatInventoryUpdatedAt(value: string | undefined): string {
  return formatDateTime(value) ?? '—'
}
