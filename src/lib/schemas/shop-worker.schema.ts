import { z } from 'zod'

import { roleSummarySchema } from '#/lib/schemas/role.schema'

export const shopWorkerSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  roleId: z.string(),
  assignedShopId: z.string().nullable().optional(),
  role: roleSummarySchema.optional(),
})
export type ShopWorker = z.infer<typeof shopWorkerSchema>

export const shopWorkerListSchema = z.array(shopWorkerSchema).catch(() => [])
export type ShopWorkerList = z.infer<typeof shopWorkerListSchema>

export const assignShopWorkerInputSchema = z.object({
  email: z.email('Enter a valid email'),
})
export type AssignShopWorkerInput = z.infer<typeof assignShopWorkerInputSchema>

export const unassignShopWorkerInputSchema = assignShopWorkerInputSchema
export type UnassignShopWorkerInput = z.infer<
  typeof unassignShopWorkerInputSchema
>
