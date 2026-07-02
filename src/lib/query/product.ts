import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  addProductAttribute,
  addProductAttributeValue,
  addProductSku,
  createProduct,
  deleteProduct,
  deleteProductAttribute,
  deleteProductAttributeValue,
  deleteProductSku,
  getProduct,
  getShopProduct,
  listProducts,
  listShopProducts,
  setProductSkuInventory,
  setProductSkuSelections,
  updateProduct,
  updateProductAttribute,
  updateProductAttributeValue,
  updateProductSku,
} from '#/lib/api/product'
import type {
  AddAttributeInput,
  AddAttributeValueInput,
  AddSkuInput,
  CreateProductInput,
  ProductListQuery,
  ShopProductListQuery,
  SetSkuInventoryInput,
  SetSkuSelectionsInput,
  UpdateAttributeInput,
  UpdateAttributeValueInput,
  UpdateProductInput,
  UpdateSkuInput,
} from '#/lib/api/product'
import { QUERY_STALE_TIME_MS } from '#/lib/query/constants'
import { productKeys } from '#/lib/query/keys'
import { createMutationOptions } from '#/lib/query/mutation'
import type { Maybe } from '#/lib/types'

export function productListQueryOptions(
  accessToken: Maybe<string>,
  query: ProductListQuery,
) {
  return queryOptions({
    queryKey: productKeys.list(accessToken ?? null, query),
    queryFn: ({ signal }) => listProducts(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function productDetailQueryOptions(
  accessToken: Maybe<string>,
  idOrSlug: string,
) {
  return queryOptions({
    queryKey: productKeys.detail(accessToken ?? null, idOrSlug),
    queryFn: ({ signal }) => getProduct(accessToken, idOrSlug, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function shopProductListQueryOptions(
  accessToken: string,
  query: ShopProductListQuery,
) {
  return queryOptions({
    queryKey: productKeys.shopList(accessToken, query),
    queryFn: ({ signal }) => listShopProducts(accessToken, query, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function shopProductDetailQueryOptions(
  accessToken: string,
  productId: string,
) {
  return queryOptions({
    queryKey: productKeys.shopDetail(accessToken, productId),
    queryFn: ({ signal }) => getShopProduct(accessToken, productId, signal),
    staleTime: QUERY_STALE_TIME_MS,
  })
}

export function invalidateProductQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: productKeys.all })
}

export function invalidateProductDetail(
  queryClient: QueryClient,
  accessToken: Maybe<string>,
  idOrSlug: string,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: productKeys.detail(accessToken ?? null, idOrSlug),
  })
}

export function invalidateShopProductDetail(
  queryClient: QueryClient,
  accessToken: string,
  productId: string,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: productKeys.shopDetail(accessToken, productId),
  })
}

export type UpdateProductMutationInput = {
  productId: string
  input: UpdateProductInput
}

export type AddProductSkuMutationInput = {
  productId: string
  input: AddSkuInput
}

export type UpdateProductSkuMutationInput = {
  skuId: string
  input: UpdateSkuInput
}

export type SetProductSkuSelectionsMutationInput = {
  skuId: string
  input: SetSkuSelectionsInput
}

export type SetProductSkuInventoryMutationInput = {
  skuId: string
  input: SetSkuInventoryInput
}

export type AddProductAttributeMutationInput = {
  productId: string
  input: AddAttributeInput
}

export type UpdateProductAttributeMutationInput = {
  attributeId: string
  input: UpdateAttributeInput
}

export type AddProductAttributeValueMutationInput = {
  attributeId: string
  input: AddAttributeValueInput
}

export type UpdateProductAttributeValueMutationInput = {
  attributeValueId: string
  input: UpdateAttributeValueInput
}

export function productMutations(
  accessToken: string,
  queryClient: QueryClient,
) {
  const afterProductChange = (): Promise<void> =>
    invalidateProductQueries(queryClient)

  const afterProductDetailChange = (
    productId: string,
  ): Promise<void> =>
    Promise.all([
      invalidateProductQueries(queryClient),
      invalidateProductDetail(queryClient, accessToken, productId),
      invalidateShopProductDetail(queryClient, accessToken, productId),
    ]).then(() => undefined)

  return {
    create: createMutationOptions({
      mutationKey: productKeys.mutation('create', accessToken),
      mutationFn: (input: CreateProductInput) =>
        createProduct(accessToken, input),
      afterSuccess: () => afterProductChange(),
    }),
    update: createMutationOptions({
      mutationKey: productKeys.mutation('update', accessToken),
      mutationFn: ({ productId, input }: UpdateProductMutationInput) =>
        updateProduct(accessToken, productId, input),
      afterSuccess: (_data, { productId }) =>
        afterProductDetailChange(productId),
    }),
    delete: createMutationOptions({
      mutationKey: productKeys.mutation('delete', accessToken),
      mutationFn: (productId: string) => deleteProduct(accessToken, productId),
      afterSuccess: () => afterProductChange(),
    }),
    addSku: createMutationOptions({
      mutationKey: productKeys.mutation('add-sku', accessToken),
      mutationFn: ({ productId, input }: AddProductSkuMutationInput) =>
        addProductSku(accessToken, productId, input),
      afterSuccess: (_data, { productId }) =>
        afterProductDetailChange(productId),
    }),
    updateSku: createMutationOptions({
      mutationKey: productKeys.mutation('update-sku', accessToken),
      mutationFn: ({ skuId, input }: UpdateProductSkuMutationInput) =>
        updateProductSku(accessToken, skuId, input),
      afterSuccess: () => afterProductChange(),
    }),
    deleteSku: createMutationOptions({
      mutationKey: productKeys.mutation('delete-sku', accessToken),
      mutationFn: (skuId: string) => deleteProductSku(accessToken, skuId),
      afterSuccess: () => afterProductChange(),
    }),
    setSkuSelections: createMutationOptions({
      mutationKey: productKeys.mutation('set-sku-selections', accessToken),
      mutationFn: ({ skuId, input }: SetProductSkuSelectionsMutationInput) =>
        setProductSkuSelections(accessToken, skuId, input),
      afterSuccess: () => afterProductChange(),
    }),
    setSkuInventory: createMutationOptions({
      mutationKey: productKeys.mutation('set-sku-inventory', accessToken),
      mutationFn: ({ skuId, input }: SetProductSkuInventoryMutationInput) =>
        setProductSkuInventory(accessToken, skuId, input),
      afterSuccess: () => afterProductChange(),
    }),
    addAttribute: createMutationOptions({
      mutationKey: productKeys.mutation('add-attribute', accessToken),
      mutationFn: ({ productId, input }: AddProductAttributeMutationInput) =>
        addProductAttribute(accessToken, productId, input),
      afterSuccess: (_data, { productId }) =>
        afterProductDetailChange(productId),
    }),
    updateAttribute: createMutationOptions({
      mutationKey: productKeys.mutation('update-attribute', accessToken),
      mutationFn: ({
        attributeId,
        input,
      }: UpdateProductAttributeMutationInput) =>
        updateProductAttribute(accessToken, attributeId, input),
      afterSuccess: () => afterProductChange(),
    }),
    deleteAttribute: createMutationOptions({
      mutationKey: productKeys.mutation('delete-attribute', accessToken),
      mutationFn: (attributeId: string) =>
        deleteProductAttribute(accessToken, attributeId),
      afterSuccess: () => afterProductChange(),
    }),
    addAttributeValue: createMutationOptions({
      mutationKey: productKeys.mutation('add-attribute-value', accessToken),
      mutationFn: ({
        attributeId,
        input,
      }: AddProductAttributeValueMutationInput) =>
        addProductAttributeValue(accessToken, attributeId, input),
      afterSuccess: () => afterProductChange(),
    }),
    updateAttributeValue: createMutationOptions({
      mutationKey: productKeys.mutation('update-attribute-value', accessToken),
      mutationFn: ({
        attributeValueId,
        input,
      }: UpdateProductAttributeValueMutationInput) =>
        updateProductAttributeValue(accessToken, attributeValueId, input),
      afterSuccess: () => afterProductChange(),
    }),
    deleteAttributeValue: createMutationOptions({
      mutationKey: productKeys.mutation('delete-attribute-value', accessToken),
      mutationFn: (attributeValueId: string) =>
        deleteProductAttributeValue(accessToken, attributeValueId),
      afterSuccess: () => afterProductChange(),
    }),
  } as const
}
