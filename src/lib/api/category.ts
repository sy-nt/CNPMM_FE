import { z } from 'zod'

import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import { CATEGORY_TREE_DEPTH } from '#/lib/api/category.constants'
import {
  categoryListResponseSchema,
  categoryTreeNodeSchema,
} from '#/lib/schemas/category.schema'
import type {
  Category,
  CategoryTreeNode,
  CategoryTreeResponse,
} from '#/lib/schemas/category.schema'
import { findBySlug } from '#/lib/slug'
import type { Maybe } from '#/lib/types'

export type CategoryListQuery = PaginationQuery<
  'createdAt' | 'updatedAt' | 'displayOrder' | 'name'
>

export type CategoryTreeQuery = {
  depth?: number
}

export type CreateCategoryInput = {
  name: string
  description?: string
  displayOrder?: number
  iconUrl?: string
  parentId?: string | null
}

export type UpdateCategoryInput = {
  name?: string
  description?: string
  displayOrder?: number
  iconUrl?: string
  isActive?: boolean
  parentId?: string | null
}

const _categoryIndex = new Map<string, Category>()

export function getCachedCategory(id: string): Category | undefined {
  return _categoryIndex.get(id)
}

export function getCachedCategories(): ReadonlyArray<Category> {
  return Array.from(_categoryIndex.values())
}

export async function listCategories(
  accessToken: Maybe<string>,
  query: CategoryListQuery = {},
  signal?: AbortSignal,
): Promise<ReadonlyArray<Category>> {
  const data = await apiRequest<unknown>('/categories/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  const parsed = categoryListResponseSchema.parse(data)
  for (const category of parsed.items) _cacheCategory(category)
  return parsed.items
}

export async function getCategory(
  accessToken: Maybe<string>,
  categoryId: string,
  query: CategoryTreeQuery = {},
  signal?: AbortSignal,
): Promise<CategoryTreeResponse> {
  const raw = await apiRequest<unknown>(
    `/category/${encodeURIComponent(categoryId)}`,
    {
      method: 'GET',
      accessToken,
      query,
      signal,
    },
  )
  return _parseAndIndexTreeResponse(raw)
}

/** @deprecated Use {@link getCategory} — `/category/:id/tree` was removed. */
export async function getCategoryTree(
  accessToken: Maybe<string>,
  categoryId: string,
  query: CategoryTreeQuery = {},
  signal?: AbortSignal,
): Promise<CategoryTreeResponse> {
  return getCategory(accessToken, categoryId, query, signal)
}

export async function resolveCategoryBySlug(
  accessToken: Maybe<string>,
  slug: string,
  signal?: AbortSignal,
): Promise<Category | null> {
  const trimmedSlug = slug.trim()
  if (!trimmedSlug) return null

  const bySlug = (category: Category): string => category.slug
  const cached = findBySlug(getCachedCategories(), bySlug, trimmedSlug)
  if (cached) return cached

  const roots = await listCategories(accessToken, {}, signal)
  const fromRoots = findBySlug(roots, bySlug, trimmedSlug)
  if (fromRoots) return fromRoots

  await Promise.all(
    roots.map((root) =>
      getCategory(
        accessToken,
        root.id,
        { depth: CATEGORY_TREE_DEPTH },
        signal,
      ),
    ),
  )

  return findBySlug(getCachedCategories(), bySlug, trimmedSlug) ?? null
}

export function clearCategoryIndex(): void {
  _categoryIndex.clear()
}

function _parseAndIndexTreeResponse(raw: unknown): CategoryTreeResponse {
  const rootResult = categoryTreeNodeSchema.safeParse(raw)
  if (rootResult.success) {
    _indexTreeNode(rootResult.data)
    return [...rootResult.data.children]
  }

  const arrayResult = z.array(categoryTreeNodeSchema).safeParse(raw)
  if (arrayResult.success) {
    for (const node of arrayResult.data) _indexTreeNode(node)
    return arrayResult.data
  }

  const envelopeResult = z
    .object({ items: z.array(categoryTreeNodeSchema) })
    .safeParse(raw)
  if (envelopeResult.success) {
    for (const node of envelopeResult.data.items) _indexTreeNode(node)
    return envelopeResult.data.items
  }

  return []
}

function _indexTreeNode(node: CategoryTreeNode): void {
  const { children, ...flat } = node
  _cacheCategory(flat)
  for (const child of children) _indexTreeNode(child)
}

function _cacheCategory(category: Category): void {
  _categoryIndex.set(category.id, category)
}
