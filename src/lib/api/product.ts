import { invalidateCacheByPrefix, withCache } from '#/lib/api/cache'
import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import {
  productDetailSchema,
  productListResponseSchema,
} from '#/lib/schemas/product.schema'
import type {
  ProductDetail,
  ProductListResponse,
  ProductSummary,
} from '#/lib/schemas/product.schema'
import type { Maybe } from '#/lib/types'
import { stableJsonKey } from '#/lib/utils'

export type ProductListQuery = PaginationQuery<
  'createdAt' | 'name' | 'price'
> & {
  isActive?: boolean
  categoryId?: string
  shopId?: string
  search?: string
}

const PRODUCT_CACHE_PREFIX = 'product:'

export type ProductAttributeValueDraft = {
  value: string
  displayOrder?: number
}

export type ProductAttributeDraft = {
  name: string
  displayOrder?: number
  values: ReadonlyArray<ProductAttributeValueDraft>
}

export type SkuSelectionByIndex = {
  attributeIndex: number
  valueIndex: number
}

export type SkuSelectionById = {
  attributeId: string
  valueId: string
}

export type CreateProductSkuDraft = {
  skuCode: string
  name: string
  price: string
  imageKey?: string
  isActive?: boolean
  selections: ReadonlyArray<SkuSelectionByIndex>
}

export type CreateProductInput = {
  name: string
  description?: string
  price: string
  categoryId: string
  isActive?: boolean
  mainImageKey?: string
  attributes?: ReadonlyArray<ProductAttributeDraft>
  skus?: ReadonlyArray<CreateProductSkuDraft>
}

export type UpdateProductInput = {
  name?: string
  description?: string
  price?: string
  categoryId?: string
  isActive?: boolean
  mainImageKey?: string
}

export type AddSkuInput = {
  skuCode: string
  name: string
  price: string
  imageKey?: string
  isActive?: boolean
  selections: ReadonlyArray<SkuSelectionById>
}

export type UpdateSkuInput = {
  name?: string
  price?: string
  imageKey?: string
  isActive?: boolean
  expectedVersion?: number
}

export type SetSkuSelectionsInput = {
  selections: ReadonlyArray<SkuSelectionById>
}

export type SetSkuInventoryInput = {
  warehouseId: string
  quantity: number
}

export type AddAttributeInput = {
  name: string
  displayOrder?: number
  values?: ReadonlyArray<ProductAttributeValueDraft>
}

export type UpdateAttributeInput = {
  name?: string
  displayOrder?: number
}

export type AddAttributeValueInput = {
  value: string
  displayOrder?: number
}

export type UpdateAttributeValueInput = {
  value?: string
  displayOrder?: number
}

export function listProducts(
  accessToken: Maybe<string>,
  query: ProductListQuery = {},
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  return withCache(
    { key: `${PRODUCT_CACHE_PREFIX}list:${stableJsonKey(query)}` },
    async (innerSignal) => {
      const data = await apiRequest<unknown>('/products/', {
        method: 'GET',
        accessToken,
        query,
        signal: innerSignal,
      })
      return productListResponseSchema.parse(data)
    },
    signal,
  )
}

export async function getRandomProductSample(
  accessToken: Maybe<string>,
  options: {
    poolSize: number
    displayCount: number
    query?: Omit<ProductListQuery, 'page' | 'limit'>
  },
  signal?: AbortSignal,
): Promise<ReadonlyArray<ProductSummary>> {
  const { poolSize, displayCount, query = {} } = options
  const response = await listProducts(
    accessToken,
    { ...query, page: 1, limit: poolSize },
    signal,
  )
  return _shuffleAndTake(response.items, displayCount)
}

export function invalidateProducts(): void {
  invalidateCacheByPrefix(PRODUCT_CACHE_PREFIX)
}

function _shuffleAndTake<T>(
  items: ReadonlyArray<T>,
  count: number,
): ReadonlyArray<T> {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr.slice(0, count)
}

export function createProduct(
  accessToken: string,
  input: CreateProductInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/product/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function getProduct(
  accessToken: Maybe<string>,
  idOrSlug: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return withCache(
    { key: `${PRODUCT_CACHE_PREFIX}detail:${idOrSlug}` },
    async (innerSignal) => {
      const data = await apiRequest<unknown>(
        `/product/${encodeURIComponent(idOrSlug)}`,
        {
          method: 'GET',
          accessToken,
          signal: innerSignal,
        },
      )
      return productDetailSchema.parse(data)
    },
    signal,
  )
}

export function updateProduct(
  accessToken: string,
  productId: string,
  input: UpdateProductInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/${productId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteProduct(
  accessToken: string,
  productId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/${productId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function addProductSku(
  accessToken: string,
  productId: string,
  input: AddSkuInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/${productId}/sku`, {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function updateProductSku(
  accessToken: string,
  skuId: string,
  input: UpdateSkuInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/sku/${skuId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteProductSku(
  accessToken: string,
  skuId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/sku/${skuId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function setProductSkuSelections(
  accessToken: string,
  skuId: string,
  input: SetSkuSelectionsInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/sku/${skuId}/selections`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
}

export function setProductSkuInventory(
  accessToken: string,
  skuId: string,
  input: SetSkuInventoryInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/sku/${skuId}/inventory`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
}

export function addProductAttribute(
  accessToken: string,
  productId: string,
  input: AddAttributeInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/${productId}/attribute`, {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function updateProductAttribute(
  accessToken: string,
  attributeId: string,
  input: UpdateAttributeInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/attribute/${attributeId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteProductAttribute(
  accessToken: string,
  attributeId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/attribute/${attributeId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}

export function addProductAttributeValue(
  accessToken: string,
  attributeId: string,
  input: AddAttributeValueInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/attribute/${attributeId}/value`, {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function updateProductAttributeValue(
  accessToken: string,
  attributeValueId: string,
  input: UpdateAttributeValueInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/attribute-value/${attributeValueId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteProductAttributeValue(
  accessToken: string,
  attributeValueId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/product/attribute-value/${attributeValueId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
