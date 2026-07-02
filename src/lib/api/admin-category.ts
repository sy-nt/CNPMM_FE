import { apiRequest } from '#/lib/api/client'
import { categorySchema } from '#/lib/schemas/category.schema'
import type { Category } from '#/lib/schemas/category.schema'

import {
  clearCategoryIndex,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '#/lib/api/category'

export type { CreateCategoryInput, UpdateCategoryInput }

export async function createAdminCategory(
  accessToken: string,
  input: CreateCategoryInput,
  signal?: AbortSignal,
): Promise<Category> {
  const raw = await apiRequest<unknown>('/admin/category/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
  clearCategoryIndex()
  return categorySchema.parse(raw)
}

export async function updateAdminCategory(
  accessToken: string,
  categoryId: string,
  input: UpdateCategoryInput,
  signal?: AbortSignal,
): Promise<Category> {
  const raw = await apiRequest<unknown>(`/admin/category/${categoryId}`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
  clearCategoryIndex()
  return categorySchema.parse(raw)
}

export async function deleteAdminCategory(
  accessToken: string,
  categoryId: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest(`/admin/category/${categoryId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
  clearCategoryIndex()
}
