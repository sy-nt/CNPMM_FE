import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'

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

export function getInventoryBySku(
  accessToken: string,
  skuId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/inventory/sku/${skuId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function getInventoryByWarehouse(
  accessToken: string,
  warehouseId: string,
  query: InventoryByWarehouseQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/inventory/warehouse/${warehouseId}`, {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}

export function setInventory(
  accessToken: string,
  skuId: string,
  warehouseId: string,
  input: SetInventoryInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/inventory/${skuId}/${warehouseId}`, {
    method: 'PATCH',
    accessToken,
    body: input,
    signal,
  })
}

export function adjustInventory(
  accessToken: string,
  skuId: string,
  warehouseId: string,
  input: AdjustInventoryInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/inventory/${skuId}/${warehouseId}/adjust`, {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}
