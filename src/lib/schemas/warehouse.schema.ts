import { z } from 'zod'

export const warehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  addressId: z.string(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
})
export type Warehouse = z.infer<typeof warehouseSchema>

export const warehouseListResponseSchema = z
  .object({
    items: z.array(warehouseSchema),
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
export type WarehouseListResponse = z.infer<typeof warehouseListResponseSchema>
