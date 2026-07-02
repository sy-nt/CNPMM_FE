import { PAGINATION_DEFAULTS } from '#/lib/api/common'
import type {
  DiscountClaimListQuery,
  PlatformDiscountListQuery,
} from '#/lib/api/discount'
import {
  DISCOUNT_TYPES,
  DISCOUNT_VALUE_TYPES,
} from '#/lib/schemas/discount.schema'
import type {
  DiscountClaim,
  DiscountClaimSummary,
  DiscountRule,
  DiscountType,
  DiscountValueType,
  PlatformDiscount,
} from '#/lib/schemas/discount.schema'
import { formatPrice } from '#/lib/format'

export const PLATFORM_DISCOUNT_HOME_LIMIT = 12

export const PLATFORM_DISCOUNT_SLIDER_ITEMS_PER_SLIDE = 3

export const PLATFORM_DISCOUNT_SLIDER_AUTOPLAY_INTERVAL_MS = 4_000

export const PLATFORM_DISCOUNT_HOME_QUERY = {
  page: PAGINATION_DEFAULTS.PAGE,
  limit: PLATFORM_DISCOUNT_HOME_LIMIT,
  sort: PAGINATION_DEFAULTS.SORT,
  orderBy: 'createdAt',
} as const satisfies PlatformDiscountListQuery

export const MY_DISCOUNT_CLAIMS_DEFAULT_QUERY = {
  page: PAGINATION_DEFAULTS.PAGE,
  limit: PAGINATION_DEFAULTS.LIMIT,
  sort: PAGINATION_DEFAULTS.SORT,
  orderBy: 'createdAt',
} as const satisfies DiscountClaimListQuery

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  [DISCOUNT_TYPES.ITEMS]: 'Items',
  [DISCOUNT_TYPES.DELIVERY]: 'Shipping',
}

export const DISCOUNT_RULE_LABELS: Record<string, string> = {
  min_subtotal: 'Minimum order',
}

export function formatDiscountType(
  discountType: DiscountType | null | undefined,
): string | null {
  if (!discountType) return null
  return DISCOUNT_TYPE_LABELS[discountType]
}

export function formatDiscountValue(
  value: string,
  valueType: DiscountValueType,
  maxDiscountAmount?: string | null,
): string {
  if (valueType === DISCOUNT_VALUE_TYPES.PERCENTAGE) {
    const base = `${value}% off`
    const cap = formatPrice(maxDiscountAmount)
    return cap ? `${base} (max ${cap})` : base
  }

  const amount = formatPrice(value)
  return amount ? `${amount} off` : `${value} off`
}

export function formatDiscountRule(rule: DiscountRule): string | null {
  const label = DISCOUNT_RULE_LABELS[rule.type] ?? rule.type.replace(/_/g, ' ')
  const amount = rule.params.amount
  if (typeof amount === 'string') {
    const formatted = formatPrice(amount)
    if (formatted) return `${label}: ${formatted}`
  }
  return label
}

export function collectClaimedDiscountIds(
  claims: ReadonlyArray<DiscountClaim>,
): ReadonlySet<string> {
  return new Set(claims.map((claim) => claim.discount.id))
}

export function resolveDiscountDetails(
  claim: DiscountClaim,
): DiscountClaimSummary {
  return claim.discount
}

export function getPlatformDiscountCode(
  discount: Pick<PlatformDiscount, 'code' | 'name'>,
): string {
  return discount.code ?? discount.name
}
