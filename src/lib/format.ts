import { STOREFRONT_LOCALE } from '#/lib/datetime.constants'

const STOREFRONT_CURRENCY = 'VND'

const _priceFormatter = new Intl.NumberFormat(STOREFRONT_LOCALE, {
  style: 'currency',
  currency: STOREFRONT_CURRENCY,
  maximumFractionDigits: 0,
})

export function formatPrice(price: string | null | undefined): string | null {
  if (!price) return null
  const numeric = Number(price)
  if (!Number.isFinite(numeric)) return null
  return _priceFormatter.format(numeric)
}
