import { z } from 'zod'

import { apiDateTimeStringSchema } from '#/lib/datetime'

export const DISCOUNT_VALUE_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const

export type DiscountValueType =
  (typeof DISCOUNT_VALUE_TYPES)[keyof typeof DISCOUNT_VALUE_TYPES]

export const DISCOUNT_TYPES = {
  ITEMS: 'items',
  DELIVERY: 'delivery',
} as const

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES]

export const DISCOUNT_SCOPES = {
  GLOBAL: 'global',
  SHOP: 'shop',
} as const

export type DiscountScope = (typeof DISCOUNT_SCOPES)[keyof typeof DISCOUNT_SCOPES]

export const discountRuleSchema = z.object({
  type: z.string(),
  params: z.record(z.string(), z.unknown()),
})
export type DiscountRule = z.infer<typeof discountRuleSchema>

export const platformDiscountSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  description: z.string().nullable().optional(),
  value: z.string(),
  valueType: z.enum([
    DISCOUNT_VALUE_TYPES.PERCENTAGE,
    DISCOUNT_VALUE_TYPES.FIXED,
  ]),
  discountType: z.enum([DISCOUNT_TYPES.ITEMS, DISCOUNT_TYPES.DELIVERY]),
  scope: z.enum([DISCOUNT_SCOPES.GLOBAL, DISCOUNT_SCOPES.SHOP]),
  maxDiscountAmount: z.string().nullable().optional(),
  validFrom: apiDateTimeStringSchema.nullable().optional(),
  validUntil: apiDateTimeStringSchema.nullable().optional(),
  rules: z.array(discountRuleSchema).optional(),
})
export type PlatformDiscount = z.infer<typeof platformDiscountSchema>

export const discountListResponseSchema = z
  .object({
    items: z.array(platformDiscountSchema),
    currentPage: z.number().int().nonnegative().catch(1),
    limit: z.number().int().positive().catch(0),
    total: z.number().int().nonnegative().catch(0),
    totalPage: z.number().int().nonnegative().catch(0),
  })
  .catch(() => ({
    items: [],
    currentPage: 1,
    limit: 0,
    total: 0,
    totalPage: 0,
  }))
export type DiscountListResponse = z.infer<typeof discountListResponseSchema>

export const discountClaimSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  description: z.string().nullable().optional(),
  value: z.string(),
  valueType: z.enum([
    DISCOUNT_VALUE_TYPES.PERCENTAGE,
    DISCOUNT_VALUE_TYPES.FIXED,
  ]),
  discountType: z.enum([DISCOUNT_TYPES.ITEMS, DISCOUNT_TYPES.DELIVERY]),
  scope: z.enum([DISCOUNT_SCOPES.GLOBAL, DISCOUNT_SCOPES.SHOP]),
  shopId: z.string().nullable().optional(),
  maxDiscountAmount: z.string().nullable().optional(),
  validFrom: apiDateTimeStringSchema.nullable().optional(),
  validUntil: apiDateTimeStringSchema.nullable().optional(),
})
export type DiscountClaimSummary = z.infer<typeof discountClaimSummarySchema>

export const discountClaimSchema = z.object({
  id: z.string(),
  userId: z.string(),
  claimedAt: apiDateTimeStringSchema,
  discount: discountClaimSummarySchema,
})
export type DiscountClaim = z.infer<typeof discountClaimSchema>

export const discountClaimListResponseSchema = z
  .object({
    items: z.array(discountClaimSchema),
    currentPage: z.number().int().nonnegative().catch(1),
    limit: z.number().int().positive().catch(0),
    total: z.number().int().nonnegative().catch(0),
    totalPage: z.number().int().nonnegative().catch(0),
  })
  .catch(() => ({
    items: [],
    currentPage: 1,
    limit: 0,
    total: 0,
    totalPage: 0,
  }))
export type DiscountClaimListResponse = z.infer<
  typeof discountClaimListResponseSchema
>
