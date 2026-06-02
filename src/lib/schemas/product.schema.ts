import { z } from 'zod'

import { categorySchema } from '#/lib/schemas/category.schema'

export const productSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.string(),
  mainImageKey: z.string().nullable().optional(),
  categoryId: z.string(),
  shopId: z.string(),
})
export type ProductSummary = z.infer<typeof productSummarySchema>

export const productListResponseSchema = z
  .object({
    items: z.array(productSummarySchema),
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
export type ProductListResponse = z.infer<typeof productListResponseSchema>

export const productAttributeValueSchema = z.object({
  id: z.string(),
  attributeId: z.string(),
  value: z.string(),
  displayOrder: z.number().int().catch(0),
})
export type ProductAttributeValue = z.infer<typeof productAttributeValueSchema>

export const productAttributeSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayOrder: z.number().int().catch(0),
  values: z.array(productAttributeValueSchema).default([]),
})
export type ProductAttribute = z.infer<typeof productAttributeSchema>

export const productSkuSelectionSchema = z.object({
  attributeId: z.string(),
  attributeValueId: z.string(),
})
export type ProductSkuSelection = z.infer<typeof productSkuSelectionSchema>

export const productSkuSchema = z.object({
  id: z.string(),
  spuId: z.string(),
  skuCode: z.string(),
  name: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  isActive: z.boolean().catch(true),
  version: z.number().int().catch(1),
  quantity: z.number().int().nonnegative().catch(0),
  selections: z.array(productSkuSelectionSchema).default([]),
})
export type ProductSku = z.infer<typeof productSkuSchema>

export const productDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  mainImageKey: z.string().nullable().optional(),
  categoryId: z.string(),
  category: categorySchema.nullable().optional(),
  shopId: z.string(),
  isActive: z.boolean().catch(true),
  version: z.number().int().catch(1),
  attributes: z.array(productAttributeSchema).default([]),
  skus: z.array(productSkuSchema).default([]),
})
export type ProductDetail = z.infer<typeof productDetailSchema>
