import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import {
  inventoryBySkuListSchema,
  inventoryByWarehouseListResponseSchema,
  inventoryRowSchema,
} from '#/lib/schemas/inventory.schema'
import type {
  InventoryBySkuList,
  InventoryByWarehouseListResponse,
  InventoryRow,
} from '#/lib/schemas/inventory.schema'

export type InventoryByWarehouseQuery = PaginationQuery<
  'updatedAt' | 'createdAt' | 'quantity'
>

export type SetInventoryInput = {
  quantity: number
}

export type AdjustInventoryInput = {
  delta: number
  expectedVersion?: number
}

export async function getInventoryBySku(
  accessToken: string,
  skuId: string,
  signal?: AbortSignal,
): Promise<InventoryBySkuList> {
  const raw = await apiRequest<unknown>(`/shop/inventory/sku/${skuId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
  return inventoryBySkuListSchema.parse(raw)
}

export async function getInventoryByWarehouse(
  accessToken: string,
  warehouseId: string,
  query: InventoryByWarehouseQuery = {},
  signal?: AbortSignal,
): Promise<InventoryByWarehouseListResponse> {
  const raw = await apiRequest<unknown>(
    `/shop/inventory/warehouse/${warehouseId}`,
    {
      method: 'GET',
      accessToken,
      query,
      signal,
    },
  )
  return inventoryByWarehouseListResponseSchema.parse(raw)
}

export async function setInventory(
  accessToken: string,
  skuId: string,
  warehouseId: string,
  input: SetInventoryInput,
  signal?: AbortSignal,
): Promise<InventoryRow> {
  const raw = await apiRequest<unknown>(
    `/shop/inventory/${skuId}/${warehouseId}`,
    {
      method: 'PATCH',
      accessToken,
      body: input,
      signal,
    },
  )
  return inventoryRowSchema.parse(raw)
}

export async function adjustInventory(
  accessToken: string,
  skuId: string,
  warehouseId: string,
  input: AdjustInventoryInput,
  signal?: AbortSignal,
): Promise<InventoryRow> {
  const raw = await apiRequest<unknown>(
    `/shop/inventory/${skuId}/${warehouseId}/adjust`,
    {
      method: 'POST',
      accessToken,
      body: input,
      signal,
    },
  )
  return inventoryRowSchema.parse(raw)
}
