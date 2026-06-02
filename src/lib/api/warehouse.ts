import { apiRequest } from '#/lib/api/client'
import type { PaginationQuery } from '#/lib/api/common'

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

export function listWarehouses(
  accessToken: string,
  query: WarehouseListQuery = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/warehouses/', {
    method: 'GET',
    accessToken,
    query,
    signal,
  })
}

export function getWarehouse(
  accessToken: string,
  warehouseId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/warehouse/${warehouseId}`, {
    method: 'GET',
    accessToken,
    signal,
  })
}

export function createWarehouse(
  accessToken: string,
  input: CreateWarehouseInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest('/warehouse/', {
    method: 'POST',
    accessToken,
    body: input,
    signal,
  })
}

export function updateWarehouse(
  accessToken: string,
  warehouseId: string,
  input: UpdateWarehouseInput,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/warehouse/${warehouseId}`, {
    method: 'PUT',
    accessToken,
    body: input,
    signal,
  })
}

export function deleteWarehouse(
  accessToken: string,
  warehouseId: string,
  signal?: AbortSignal,
): Promise<unknown> {
  return apiRequest(`/warehouse/${warehouseId}`, {
    method: 'DELETE',
    accessToken,
    signal,
  })
}
