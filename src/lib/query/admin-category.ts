import type { QueryClient } from '@tanstack/react-query'

import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory
  
  
} from '#/lib/api/admin-category'
import type {CreateCategoryInput, UpdateCategoryInput} from '#/lib/api/admin-category';
import { adminCategoryKeys, categoryKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export type UpdateAdminCategoryMutationInput = {
  categoryId: string
  input: UpdateCategoryInput
}

export function invalidateAdminCategoryQueries(
  queryClient: QueryClient,
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all }),
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  ]).then(() => undefined)
}

export function adminCategoryMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterCategoryChange = (): Promise<void> =>
    invalidateAdminCategoryQueries(queryClient)

  return {
    create: createMutationOptions({
      mutationKey: adminCategoryKeys.mutation('create', accessToken),
      mutationFn: (input: CreateCategoryInput) =>
        createAdminCategory(accessToken, input),
      afterSuccess: () => afterCategoryChange(),
    }),
    update: createMutationOptions({
      mutationKey: adminCategoryKeys.mutation('update', accessToken),
      mutationFn: ({ categoryId, input }: UpdateAdminCategoryMutationInput) =>
        updateAdminCategory(accessToken, categoryId, input),
      afterSuccess: () => afterCategoryChange(),
    }),
    delete: createMutationOptions({
      mutationKey: adminCategoryKeys.mutation('delete', accessToken),
      mutationFn: (categoryId: string) =>
        deleteAdminCategory(accessToken, categoryId),
      afterSuccess: () => afterCategoryChange(),
    }),
  } as const
}
