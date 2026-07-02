import { z } from 'zod'

import { apiDateTimeStringSchema } from '#/lib/datetime'

const _optionalString = z.string().nullable().optional()

export const inventorySkuSummarySchema = z.object({
  id: z.string(),
  skuCode: z.string(),
  name: _optionalString,
  imageKey: _optionalString,
  imageUrl: _optionalString,
})
export type InventorySkuSummary = z.infer<typeof inventorySkuSummarySchema>

export const inventoryProductSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  mainImageKey: _optionalString,
  imageUrl: _optionalString,
})
export type InventoryProductSummary = z.infer<
  typeof inventoryProductSummarySchema
>

export const inventoryRowSchema = z.object({
  skuId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().int().nonnegative(),
  reservedQuantity: z.number().int().nonnegative(),
  version: z.number().int().positive(),
  updatedAt: apiDateTimeStringSchema,
  sku: inventorySkuSummarySchema.optional(),
  product: inventoryProductSummarySchema.optional(),
})
export type InventoryRow = z.infer<typeof inventoryRowSchema>

export const inventoryBySkuListSchema = z
  .array(inventoryRowSchema)
  .catch(() => [])
export type InventoryBySkuList = z.infer<typeof inventoryBySkuListSchema>

export const inventoryByWarehouseListResponseSchema = z
  .object({
    items: z.array(inventoryRowSchema),
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
export type InventoryByWarehouseListResponse = z.infer<
  typeof inventoryByWarehouseListResponseSchema
>
