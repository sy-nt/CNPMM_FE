import type { ProductSku } from '#/lib/schemas/product.schema'
import { cn } from '#/lib/utils'

const LOW_STOCK_THRESHOLD = 5

export type StockInfo = {
  /** `null` when the storefront can't read stock yet (e.g. no SKU picked). */
  available: number | null
  message: string
  tone: 'muted' | 'positive' | 'warning' | 'danger'
}

export function resolveStockInfo({
  matchedSku,
  skuRequired,
}: {
  matchedSku: ProductSku | undefined
  skuRequired: boolean
}): StockInfo {
  if (!skuRequired) {
    return { available: null, message: '', tone: 'muted' }
  }
  if (!matchedSku) {
    return {
      available: null,
      message: 'Pick options to see stock.',
      tone: 'muted',
    }
  }
  if (matchedSku.quantity === 0) {
    return { available: 0, message: 'Out of stock', tone: 'danger' }
  }
  if (matchedSku.quantity <= LOW_STOCK_THRESHOLD) {
    return {
      available: matchedSku.quantity,
      message: `Only ${matchedSku.quantity} left`,
      tone: 'warning',
    }
  }
  return {
    available: matchedSku.quantity,
    message: `${matchedSku.quantity} in stock`,
    tone: 'positive',
  }
}

type StockIndicatorProps = {
  info: StockInfo
}

export function StockIndicator({ info }: StockIndicatorProps) {
  if (!info.message) return null
  const toneClass = {
    muted: 'text-muted-foreground',
    positive: 'text-foreground',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-destructive',
  }[info.tone]
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn('text-xs font-medium', toneClass)}
    >
      {info.message}
    </p>
  )
}
