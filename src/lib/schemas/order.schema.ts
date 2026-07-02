import { z } from 'zod'

import { apiDateTimeStringSchema } from '#/lib/datetime'

const _optionalString = z.string().nullable().optional()

const _decimalString = z
  .string()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Must be a decimal amount')

export const appliedDiscountSchema = z.object({
  amount: _decimalString,
  claimId: z.string().optional(),
  discountId: z.string(),
})

export const checkoutCartLineSchema = z.object({
  imageKey: _optionalString,
  name: z.string(),
  quantity: z.number().int().nonnegative(),
  shopId: z.string(),
  skuId: z.string(),
  spuId: z.string(),
  unitPrice: _decimalString,
})

export const perShopBundleSchema = z.object({
  items: z.array(checkoutCartLineSchema),
  itemsSubtotal: _decimalString,
  shopId: z.string(),
})

export const checkoutPreviewBundleSchema = z.object({
  bundle: perShopBundleSchema,
  delivery: z.object({
    deliveryMethodId: z.string(),
    etaMaxDays: z.number().int(),
    etaMinDays: z.number().int(),
    fee: _decimalString,
    originWarehouseId: z.string(),
    providerCode: z.string(),
    zoneCode: _optionalString,
  }),
  discounts: z.object({
    deliveryDiscount: appliedDiscountSchema.nullable().optional(),
    itemsDiscount: appliedDiscountSchema.nullable().optional(),
  }),
  totalAmount: _decimalString,
})
export type AppliedDiscount = z.infer<typeof appliedDiscountSchema>

export type CheckoutCartLine = z.infer<typeof checkoutCartLineSchema>

export type PerShopBundle = z.infer<typeof perShopBundleSchema>

export type CheckoutPreviewBundle = z.infer<typeof checkoutPreviewBundleSchema>

export const checkoutPreviewResponseSchema = z.object({
  bundles: z.array(checkoutPreviewBundleSchema),
  grandTotal: _decimalString,
})
export type CheckoutPreviewResponse = z.infer<
  typeof checkoutPreviewResponseSchema
>

export const checkoutItemSelectionSchema = z.object({
  skuId: z.string().min(1),
  quantity: z.number().int().min(1).max(500).optional(),
})
export type CheckoutItemSelection = z.infer<typeof checkoutItemSelectionSchema>

export const checkoutPreviewInputSchema = z.object({
  destinationAddressId: z.string(),
  deliveryMethodId: z.string(),
  items: z.array(checkoutItemSelectionSchema).min(1),
  claimedDiscountIds: z.array(z.string()).optional(),
})
export type CheckoutPreviewInput = z.infer<typeof checkoutPreviewInputSchema>

export const placeOrderInputSchema = checkoutPreviewInputSchema.extend({
  expectedTotalAmount: _decimalString,
})
export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>

export const placedOrderSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  status: z.string(),
  totalAmount: _decimalString,
  itemsSubtotal: _decimalString,
  deliveryFee: _decimalString,
})
export type PlacedOrder = z.infer<typeof placedOrderSchema>

export const orderItemSummarySchema = z.object({
  id: z.string(),
  nameSnapshot: z.string(),
  quantity: z.number().int().nonnegative(),
  imageKeySnapshot: _optionalString,
  unitPriceSnapshot: _decimalString.optional(),
  subtotal: _decimalString.optional(),
})
export type OrderItemSummary = z.infer<typeof orderItemSummarySchema>

export const destinationAddressSnapshotSchema = z.object({
  name: z.string(),
  addressLine: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  district: _optionalString,
})
export type DestinationAddressSnapshot = z.infer<
  typeof destinationAddressSnapshotSchema
>

export const orderSummarySchema = z.object({
  id: z.string(),
  shopId: z.string(),
  status: z.string(),
  totalAmount: _decimalString,
  itemsSubtotal: _decimalString,
  deliveryFee: _decimalString,
  createdAt: apiDateTimeStringSchema.optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  destinationAddressSnapshot: destinationAddressSnapshotSchema.optional(),
  items: z.array(orderItemSummarySchema).default([]),
})
export type OrderSummary = z.infer<typeof orderSummarySchema>

export const orderListResponseSchema = z
  .object({
    items: z.array(orderSummarySchema),
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
export type OrderListResponse = z.infer<typeof orderListResponseSchema>

export const placeOrderResponseSchema = z.object({
  bundles: z.array(checkoutPreviewBundleSchema),
  grandTotal: _decimalString,
  orders: z.array(placedOrderSchema),
})
export type PlaceOrderResponse = z.infer<typeof placeOrderResponseSchema>
