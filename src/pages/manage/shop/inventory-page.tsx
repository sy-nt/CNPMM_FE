import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ManageActionDialog } from '#/components/manage/manage-action-dialog'
import { ManageDataTable } from '#/components/manage/manage-data-table'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { inventoryByWarehouseQueryOptions, inventoryMutations } from '#/lib/query/inventory'
import { warehouseListQueryOptions } from '#/lib/query/warehouse'
import { INVENTORY_PERMISSIONS } from '#/lib/rbac/constants'
import type { InventoryRow } from '#/lib/schemas/inventory.schema'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import {
  formatInventoryUpdatedAt,
  inventoryAvailableQuantity,
  InventoryRowThumbnail,
} from '#/pages/manage/shop/_inventory-row-display'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'
import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'

const WAREHOUSE_LIST_QUERY = {
  page: 1,
  limit: 30,
  sort: 'desc' as const,
}

const INVENTORY_LIST_BASE_QUERY = {
  limit: MANAGE_TABLE_PAGE_SIZE,
  sort: 'desc' as const,
}

export function ShopInventoryPage() {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [warehouseId, setWarehouseId] = useState('')
  const { page, setPage, resetPage } = useManageTablePage()
  const [activeRow, setActiveRow] = useState<InventoryRow | null>(null)
  const [setQuantity, setSetQuantity] = useState('')
  const [adjustDelta, setAdjustDelta] = useState('')
  const mutations = inventoryMutations(accessToken, queryClient)

  const warehousesQuery = useQuery(
    warehouseListQueryOptions(accessToken, WAREHOUSE_LIST_QUERY),
  )
  const inventoryQuery = useQuery(
    inventoryByWarehouseQueryOptions(accessToken, warehouseId, {
      ...INVENTORY_LIST_BASE_QUERY,
      page,
    }),
  )

  useEffect(() => {
    if (warehouseId || !warehousesQuery.data?.items.length) return
    setWarehouseId(warehousesQuery.data.items[0]?.id ?? '')
  }, [warehouseId, warehousesQuery.data])

  useEffect(() => {
    resetPage()
  }, [warehouseId, resetPage])

  const setMutation = useMutation({
    ...mutations.set,
    onSuccess: () => {
      toast.success('Inventory quantity updated.')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not set inventory.'
      toast.error(message)
    },
  })

  const adjustMutation = useMutation({
    ...mutations.adjust,
    onSuccess: () => {
      toast.success('Inventory adjusted.')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not adjust inventory.'
      toast.error(message)
    },
  })

  const warehouses = warehousesQuery.data?.items ?? []
  const rows = inventoryQuery.data?.items ?? []
  const totalPage = inventoryQuery.data?.totalPage ?? 1

  return (
    <ManageSection
      title="Shop inventory"
      description="Inspect stock by warehouse and update quantities when permitted."
    >
      <Card>
        <CardHeader>
          <CardTitle>Warehouse selector</CardTitle>
          <CardDescription>
            Select a warehouse to review and update inventory rows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="inventory-warehouse">Warehouse</Label>
            <select
              id="inventory-warehouse"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <ManageAsyncState
        isLoading={inventoryQuery.isLoading}
        isError={inventoryQuery.isError}
        isEmpty={rows.length === 0}
        emptyTitle="No inventory rows"
        emptyDescription="No inventory found for this warehouse."
      >
        <ManageDataTable<InventoryRow>
          columns={[
            {
              id: 'image',
              header: 'Image',
              cell: (row) => <InventoryRowThumbnail row={row} />,
            },
            {
              id: 'product',
              header: 'Product',
              cell: (row) => (
                <div className="min-w-[140px]">
                  <p className="font-medium text-foreground">
                    {row.product?.name ?? '—'}
                  </p>
                  {row.product?.slug ? (
                    <p className="text-xs text-muted-foreground">
                      {row.product.slug}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              id: 'sku',
              header: 'SKU',
              cell: (row) => (
                <div>
                  <p className="font-mono text-xs text-foreground">
                    {row.sku?.skuCode ?? row.skuId.slice(0, 8)}
                  </p>
                  {row.sku?.name ? (
                    <p className="text-xs text-muted-foreground">{row.sku.name}</p>
                  ) : null}
                </div>
              ),
            },
            { id: 'quantity', header: 'Qty', cell: (row) => row.quantity },
            { id: 'reserved', header: 'Reserved', cell: (row) => row.reservedQuantity },
            {
              id: 'available',
              header: 'Available',
              cell: (row) => inventoryAvailableQuantity(row),
            },
            {
              id: 'updated',
              header: 'Updated',
              cell: (row) => formatInventoryUpdatedAt(row.updatedAt),
            },
          ]}
          rows={rows}
          getRowKey={(row) => `${row.skuId}-${row.warehouseId}`}
          pagination={{ page, totalPage, onPageChange: setPage }}
          actions={(row) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setActiveRow(row)
                setSetQuantity(String(row.quantity))
                setAdjustDelta('0')
              }}
            >
              Adjust
            </Button>
          )}
        />
      </ManageAsyncState>

      <ManageActionDialog
        open={activeRow !== null}
        onOpenChange={(open) => {
          if (!open) setActiveRow(null)
        }}
        title="Inventory actions"
        hideConfirm
        cancelLabel="Close"
      >
        {activeRow ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inventory-set-qty">Set quantity</Label>
              <Input
                id="inventory-set-qty"
                value={setQuantity}
                onChange={(event) => setSetQuantity(event.target.value)}
              />
              <RequirePermission all={[INVENTORY_PERMISSIONS.INVENTORY_UPDATE]}>
                <Button
                  type="button"
                  size="sm"
                  disabled={setMutation.isPending}
                  onClick={() =>
                    setMutation.mutate({
                      skuId: activeRow.skuId,
                      warehouseId: activeRow.warehouseId,
                      input: { quantity: Number(setQuantity) },
                    })
                  }
                >
                  Set quantity
                </Button>
              </RequirePermission>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory-adjust-delta">Adjust delta</Label>
              <Input
                id="inventory-adjust-delta"
                value={adjustDelta}
                onChange={(event) => setAdjustDelta(event.target.value)}
              />
              <RequirePermission all={[INVENTORY_PERMISSIONS.INVENTORY_ADJUST]}>
                <Button
                  type="button"
                  size="sm"
                  disabled={adjustMutation.isPending}
                  onClick={() =>
                    adjustMutation.mutate({
                      skuId: activeRow.skuId,
                      warehouseId: activeRow.warehouseId,
                      input: {
                        delta: Number(adjustDelta),
                        expectedVersion: activeRow.version,
                      },
                    })
                  }
                >
                  Apply adjustment
                </Button>
              </RequirePermission>
            </div>
          </div>
        ) : null}
      </ManageActionDialog>
    </ManageSection>
  )
}
