import { apiRequest } from '#/lib/api/client'
import { categorySchema } from '#/lib/schemas/category.schema'
import type { Category } from '#/lib/schemas/category.schema'

import {
  clearCategoryIndex,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '#/lib/api/category'

export type { CreateCategoryInput, UpdateCategoryInput }

export async function createShopCategory(
  accessToken: string,
  input: CreateCategoryInput,
  signal?: AbortSignal,
): Promise<Category> {
  const raw = await apiRequest<unknown>('/shop/category/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
  clearCategoryIndex()
  return categorySchema.parse(raw)
}

export async function updateShopCategory(
  accessToken: string,
  categoryId: string,
  input: UpdateCategoryInput,
  signal?: AbortSignal,
): Promise<Category> {
  const raw = await apiRequest<unknown>(`/shop/category/${categoryId}`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
  clearCategoryIndex()
  return categorySchema.parse(raw)
}

export async function deleteShopCategory(
  accessToken: string,
  categoryId: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest(`/shop/category/${categoryId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
  clearCategoryIndex()
}
