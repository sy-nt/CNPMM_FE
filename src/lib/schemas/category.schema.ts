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
  .union([
    z.array(categorySchema),
    z
      .object({ items: z.array(categorySchema) })
      .transform((value) => value.items),
  ])
  .catch(() => [])
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>

export type CategoryTreeNode = Category & {
  children: ReadonlyArray<CategoryTreeNode>
}

export const categoryTreeNodeSchema: z.ZodType<CategoryTreeNode> = z.lazy(() =>
  categorySchema.extend({
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
