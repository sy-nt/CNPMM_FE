import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().nullable().optional(),
  slug: z.string(),
  iconUrl: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})
export type Category = z.infer<typeof categorySchema>

export const categoryListResponseSchema = z
  .object({
    items: z.array(categorySchema),
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
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>

export type CategoryTreeNode = Category & {
  depth?: number
  children: ReadonlyArray<CategoryTreeNode>
}

export const categoryTreeNodeSchema: z.ZodType<CategoryTreeNode> = z.lazy(() =>
  categorySchema.extend({
    depth: z.number().int().nonnegative().optional(),
    children: z.array(categoryTreeNodeSchema).default([]),
  }),
)

export const categoryTreeResponseSchema = z
  .union([
    categoryTreeNodeSchema.transform((node) => [...node.children]),
    z.array(categoryTreeNodeSchema),
    z
      .object({ items: z.array(categoryTreeNodeSchema) })
      .transform((value) => value.items),
  ])
  .catch(() => [])
export type CategoryTreeResponse = z.infer<typeof categoryTreeResponseSchema>
