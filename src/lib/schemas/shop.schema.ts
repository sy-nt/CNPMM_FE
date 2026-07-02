import { z } from 'zod'

import { addressFormSchema } from '#/lib/schemas/address.schema'

const _trimmedRequired = (max: number) =>
  z.string().trim().min(1, 'Required').max(max, `At most ${max} characters`)

export const shopPublicProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})
export type ShopPublicProfile = z.infer<typeof shopPublicProfileSchema>

export const shopDetailsEnvelopeSchema = z
  .object({
    shop: shopPublicProfileSchema,
  })
  .passthrough()
export type ShopDetailsEnvelope = z.infer<typeof shopDetailsEnvelopeSchema>

export const shopListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.string().optional(),
  description: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})
export type ShopListItem = z.infer<typeof shopListItemSchema>

export const shopListResponseSchema = z
  .object({
    items: z.array(shopListItemSchema),
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
export type ShopListResponse = z.infer<typeof shopListResponseSchema>

export const shopSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  description: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
})
export type ShopSummary = z.infer<typeof shopSummarySchema>

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const registerShopResponseSchema = z.object({
  shop: shopSummarySchema,
  tokens: authTokensSchema,
})
export type RegisterShopResponse = z.infer<typeof registerShopResponseSchema>

export const registerShopFormSchema = z.object({
  name: _trimmedRequired(255),
  description: z.string().trim().max(1000, 'At most 1000 characters').optional(),
  imageKey: z.string().trim().min(1).optional(),
  address: addressFormSchema,
})
export type RegisterShopFormInput = z.infer<typeof registerShopFormSchema>
