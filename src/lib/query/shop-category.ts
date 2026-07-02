import type { QueryClient } from '@tanstack/react-query'

import {
  createShopCategory,
  deleteShopCategory,
  updateShopCategory,
} from '#/lib/api/shop-category'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '#/lib/api/shop-category'
import { categoryKeys, shopCategoryKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'

export type UpdateShopCategoryMutationInput = {
  categoryId: string
  input: UpdateCategoryInput
}

export function invalidateShopCategoryQueries(
  queryClient: QueryClient,
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: shopCategoryKeys.all }),
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  ]).then(() => undefined)
}

export function shopCategoryMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterCategoryChange = (): Promise<void> =>
    invalidateShopCategoryQueries(queryClient)

  return {
    create: createMutationOptions({
      mutationKey: shopCategoryKeys.mutation('create', accessToken),
      mutationFn: (input: CreateCategoryInput) =>
        createShopCategory(accessToken, input),
      afterSuccess: () => afterCategoryChange(),
    }),
    update: createMutationOptions({
      mutationKey: shopCategoryKeys.mutation('update', accessToken),
      mutationFn: ({ categoryId, input }: UpdateShopCategoryMutationInput) =>
        updateShopCategory(accessToken, categoryId, input),
      afterSuccess: () => afterCategoryChange(),
    }),
    delete: createMutationOptions({
      mutationKey: shopCategoryKeys.mutation('delete', accessToken),
      mutationFn: (categoryId: string) =>
        deleteShopCategory(accessToken, categoryId),
      afterSuccess: () => afterCategoryChange(),
    }),
  } as const
}
