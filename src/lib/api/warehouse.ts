import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'
import {
  warehouseListResponseSchema,
  warehouseSchema,
} from '#/lib/schemas/warehouse.schema'
import type { Warehouse, WarehouseListResponse } from '#/lib/schemas/warehouse.schema'

export type WarehouseListQuery = PaginationQuery<
  'createdAt' | 'updatedAt' | 'name'
>

export type CreateWarehouseInput = {
  name: string
  code: string
  addressId: string
  isActive?: boolean
  isDefault?: boolean
}

export type UpdateWarehouseInput = {
  name?: string
  code?: string
  addressId?: string
  isActive?: boolean
  isDefault?: boolean
}

export async function listWarehouses(
  accessToken: string,
  query: WarehouseListQuery = {},
  signal?: AbortSignal,
): Promise<WarehouseListResponse> {
  const raw = await apiRequest<unknown>('/shop/warehouses/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
  return warehouseListResponseSchema.parse(raw)
}

export async function getWarehouse(
  accessToken: string,
  warehouseId: string,
  signal?: AbortSignal,
): Promise<Warehouse> {
  const raw = await apiRequest<unknown>(`/shop/warehouse/${warehouseId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
  return warehouseSchema.parse(raw)
}

export async function createWarehouse(
  accessToken: string,
  input: CreateWarehouseInput,
  signal?: AbortSignal,
): Promise<Warehouse> {
  const raw = await apiRequest<unknown>('/shop/warehouse/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
  return warehouseSchema.parse(raw)
}

export async function updateWarehouse(
  accessToken: string,
  warehouseId: string,
  input: UpdateWarehouseInput,
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest(`/shop/warehouse/${warehouseId}`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
}

export async function deleteWarehouse(
  accessToken: string,
  warehouseId: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest(`/shop/warehouse/${warehouseId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
