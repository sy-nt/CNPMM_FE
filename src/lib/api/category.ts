import { z } from 'zod'

import { invalidateCacheByPrefix, withCache } from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import {
  categoryListResponseSchema,
  categoryTreeNodeSchema,
} from '#/lib/schemas/category.schema'
import type {
  Category,
  CategoryTreeNode,
  CategoryTreeResponse,
} from '#/lib/schemas/category.schema'
import type { Maybe } from '#/lib/types'
import { stableJsonKey } from '#/lib/utils'

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

const CATEGORY_CACHE_PREFIX = 'category:'

const _categoryIndex = new Map<string, Category>()

export function getCachedCategory(id: string): Category | undefined {
  return _categoryIndex.get(id)
}

export function getCachedCategories(): ReadonlyArray<Category> {
  return Array.from(_categoryIndex.values())
}

export function listCategories(
  accessToken: Maybe<string>,
  query: CategoryListQuery = {},
  signal?: AbortSignal,
): Promise<ReadonlyArray<Category>> {
  return withCache(
    { key: `${CATEGORY_CACHE_PREFIX}list:${stableJsonKey(query)}` },
    async (innerSignal) => {
      const data = await apiRequest<unknown>('/categories/', {
        method: 'GET',
        accessToken,
        query,
        signal: innerSignal,
      })
      const parsed = categoryListResponseSchema.parse(data)
      for (const category of parsed) _cacheCategory(category)
      return parsed
    },
    signal,
  )
}

export function getCategoryTree(
  accessToken: Maybe<string>,
  categoryId: string,
  query: CategoryTreeQuery = {},
  signal?: AbortSignal,
): Promise<CategoryTreeResponse> {
  return withCache(
    {
      key: `${CATEGORY_CACHE_PREFIX}tree:${categoryId}:${stableJsonKey(query)}`,
    },
    async (innerSignal) => {
      const raw = await apiRequest<unknown>(`/category/${categoryId}/tree`, {
        method: 'GET',
        accessToken,
        query,
        signal: innerSignal,
      })
      return _parseAndIndexTreeResponse(raw)
    },
    signal,
  )
}

export function invalidateCategories(): void {
  invalidateCacheByPrefix(CATEGORY_CACHE_PREFIX)
  _categoryIndex.clear()
}

export function createCategory(
  accessToken: string,
  input: CreateCategoryInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/category/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  }).then((response) => {
    invalidateCategories()
    return response
  })
}

export function updateCategory(
  accessToken: string,
  categoryId: string,
  input: UpdateCategoryInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/category/${categoryId}`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  }).then((response) => {
    invalidateCategories()
    return response
  })
}

export function deleteCategory(
  accessToken: string,
  categoryId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/category/${categoryId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  }).then((response) => {
    invalidateCategories()
    return response
  })
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
