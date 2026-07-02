import type { ReactNode } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { formatDateTime } from '#/lib/datetime'
import { inventoryByWarehouseQueryOptions } from '#/lib/query/inventory'
import { warehouseListQueryOptions } from '#/lib/query/warehouse'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const INVENTORY_LIST_QUERY = {
  page: 1,
  limit: 50,
  orderBy: 'updatedAt' as const,
  sort: 'desc' as const,
}

const WAREHOUSE_LIST_QUERY = {
  page: 1,
  limit: 50,
  orderBy: 'createdAt' as const,
  sort: 'desc' as const,
}

export function PlatformInventoryPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('')

  const warehousesQuery = useQuery(warehouseListQueryOptions(accessToken, WAREHOUSE_LIST_QUERY))
  const inventoryQuery = useQuery(
    inventoryByWarehouseQueryOptions(accessToken, selectedWarehouseId, INVENTORY_LIST_QUERY),
  )

  return (
    <ManageSection
      title="Inventory"
      description="Read-only stock visibility by warehouse."
    >
      <Card>
        <CardHeader>
          <CardTitle>Select warehouse</CardTitle>
          <CardDescription>Choose a warehouse to load inventory rows.</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={selectedWarehouseId}
            onChange={(event) => setSelectedWarehouseId(event.target.value)}
          >
            <option value="">Select warehouse</option>
            {warehousesQuery.data?.items.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} ({warehouse.code})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {!selectedWarehouseId ? (
        <Card>
          <CardHeader>
            <CardTitle>Warehouse required</CardTitle>
            <CardDescription>Select a warehouse to view inventory rows.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ManageAsyncState
          isLoading={inventoryQuery.isLoading}
          isError={inventoryQuery.isError}
          isEmpty={(inventoryQuery.data?.items.length ?? 0) === 0}
          emptyTitle="No inventory rows"
          emptyDescription="This warehouse has no inventory records yet."
        >
          <div className="grid gap-4">
            {inventoryQuery.data?.items.map((row) => (
              <Card key={`${row.skuId}-${row.warehouseId}`}>
                <CardHeader>
                  <CardTitle className="text-base">{row.skuId}</CardTitle>
                  <CardDescription>Warehouse: {row.warehouseId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantity: {row.quantity}</p>
                  <p className="text-sm text-muted-foreground">
                    Reserved: {row.reservedQuantity}
                  </p>
                  <p className="text-sm text-muted-foreground">Version: {row.version}</p>
                  <p className="text-sm text-muted-foreground">
                    Updated: {formatDateTime(row.updatedAt) ?? row.updatedAt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ManageAsyncState>
      )}
    </ManageSection>
  )
}
