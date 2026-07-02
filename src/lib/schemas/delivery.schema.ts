import { z } from 'zod'

const _optionalString = z.string().nullable().optional()

export const deliveryMethodSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: _optionalString,
  etaMinDays: z.number().int().nonnegative(),
  etaMaxDays: z.number().int().nonnegative(),
  isActive: z.boolean(),
  providerCode: z.string(),
})
export type DeliveryMethod = z.infer<typeof deliveryMethodSchema>

export const deliveryMethodListSchema = z
  .array(deliveryMethodSchema)
  .catch(() => [])
export type DeliveryMethodList = z.infer<typeof deliveryMethodListSchema>

export const deliveryZoneSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: _optionalString,
  displayOrder: z.number().int().nonnegative(),
  isActive: z.boolean(),
})
export type DeliveryZone = z.infer<typeof deliveryZoneSchema>

export const deliveryZoneListSchema = z.array(deliveryZoneSchema).catch(() => [])
export type DeliveryZoneList = z.infer<typeof deliveryZoneListSchema>

export const deliveryRateSchema = z.object({
  id: z.string(),
  deliveryMethodId: z.string(),
  deliveryZoneId: z.string(),
  baseFee: z.string(),
})
export type DeliveryRate = z.infer<typeof deliveryRateSchema>

export const deliveryRateListResponseSchema = z
  .object({
    items: z.array(deliveryRateSchema),
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
export type DeliveryRateListResponse = z.infer<
  typeof deliveryRateListResponseSchema
>

export const deliverySchema = z.object({
  id: z.string(),
  deliveryMethodId: z.string(),
  destinationAddressId: z.string(),
  originAddressId: z.string(),
  etaMinDays: z.number().int().nonnegative(),
  etaMaxDays: z.number().int().nonnegative(),
  fee: z.string(),
  status: z.string(),
  providerCode: z.string(),
  orderId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  trackingCode: z.string().nullable().optional(),
  zoneCode: z.string().nullable().optional(),
})
export type Delivery = z.infer<typeof deliverySchema>

export const deliveryListResponseSchema = z
  .object({
    items: z.array(deliverySchema),
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
export type DeliveryListResponse = z.infer<typeof deliveryListResponseSchema>
