import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
import { shopAddressListQueryOptions } from '#/lib/query/address'
import type { CreateWarehouseInput } from '#/lib/api/warehouse'
import { warehouseListQueryOptions, warehouseMutations } from '#/lib/query/warehouse'
import { SHOP_ADDRESS_PERMISSIONS, WAREHOUSE_PERMISSIONS } from '#/lib/rbac/constants'
import type { Warehouse } from '#/lib/schemas/warehouse.schema'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'
import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'

const WAREHOUSE_LIST_BASE_QUERY = {
  limit: MANAGE_TABLE_PAGE_SIZE,
  sort: 'desc' as const,
}

type WarehouseFormState = CreateWarehouseInput

const _EMPTY_FORM: WarehouseFormState = {
  name: '',
  code: '',
  addressId: '',
  isActive: true,
  isDefault: false,
}

export function ShopWarehousesPage() {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<WarehouseFormState>(_EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { page, setPage } = useManageTablePage()
  const mutations = warehouseMutations(accessToken, queryClient)

  const warehousesQuery = useQuery(
    warehouseListQueryOptions(accessToken, {
      ...WAREHOUSE_LIST_BASE_QUERY,
      page,
    }),
  )
  const addressesQuery = useQuery(shopAddressListQueryOptions(accessToken))

  const createMutation = useMutation({
    ...mutations.create,
    onSuccess: () => {
      toast.success('Warehouse created.')
      setForm(_EMPTY_FORM)
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not create warehouse.'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    ...mutations.update,
    onSuccess: () => {
      toast.success('Warehouse updated.')
      setEditingId(null)
      setForm(_EMPTY_FORM)
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not update warehouse.'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    ...mutations.delete,
    onSuccess: () => {
      toast.success('Warehouse deleted.')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not delete warehouse.'
      toast.error(message)
    },
  })

  const warehouses = warehousesQuery.data?.items ?? []
  const totalPage = warehousesQuery.data?.totalPage ?? 1
  const addresses = addressesQuery.data ?? []

  return (
    <ManageSection
      title="Shop warehouses"
      description="Manage storage locations used by inventory and delivery."
    >
      <RequirePermission all={[WAREHOUSE_PERMISSIONS.WAREHOUSE_CREATE]}>
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit warehouse' : 'Create warehouse'}</CardTitle>
            <CardDescription>
              Owner and moderator roles can create and maintain warehouses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="warehouse-name">Name</Label>
                <Input
                  id="warehouse-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Warehouse name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse-code">Code</Label>
                <Input
                  id="warehouse-code"
                  value={form.code}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, code: event.target.value }))
                  }
                  placeholder="WH-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-address">Address</Label>
              <select
                id="warehouse-address"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={form.addressId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, addressId: event.target.value }))
                }
              >
                <option value="">Select address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.name} - {address.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive ?? false}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isDefault ?? false}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isDefault: event.target.checked }))
                  }
                />
                Default
              </label>
            </div>
            <Button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                const payload: CreateWarehouseInput = {
                  name: form.name.trim(),
                  code: form.code.trim(),
                  addressId: form.addressId.trim(),
                  isActive: form.isActive,
                  isDefault: form.isDefault,
                }
                if (editingId) {
                  updateMutation.mutate({ warehouseId: editingId, input: payload })
                  return
                }
                createMutation.mutate(payload)
              }}
            >
              {editingId ? 'Save warehouse' : 'Create warehouse'}
            </Button>
          </CardContent>
        </Card>
      </RequirePermission>

      <ManageAsyncState
        isLoading={warehousesQuery.isLoading}
        isError={warehousesQuery.isError}
        isEmpty={warehouses.length === 0}
        emptyTitle="No warehouses yet"
        emptyDescription="Create a warehouse to allocate stock."
      >
        <ManageDataTable<Warehouse>
          columns={[
            { id: 'name', header: 'Name', cell: (row) => row.name },
            { id: 'code', header: 'Code', cell: (row) => row.code },
            {
              id: 'default',
              header: 'Default',
              cell: (row) => (row.isDefault ? 'Yes' : 'No'),
            },
            {
              id: 'active',
              header: 'Active',
              cell: (row) => (row.isActive ? 'Yes' : 'No'),
            },
          ]}
          rows={warehouses}
          getRowKey={(row) => row.id}
          pagination={{ page, totalPage, onPageChange: setPage }}
          actions={(warehouse) => (
            <>
              <RequirePermission all={[WAREHOUSE_PERMISSIONS.WAREHOUSE_UPDATE]}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(warehouse.id)
                    setForm({
                      name: warehouse.name,
                      code: warehouse.code,
                      addressId: warehouse.addressId,
                      isActive: warehouse.isActive,
                      isDefault: warehouse.isDefault,
                    })
                  }}
                >
                  Edit
                </Button>
              </RequirePermission>
              <RequirePermission all={[WAREHOUSE_PERMISSIONS.WAREHOUSE_DELETE]}>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(warehouse.id)}
                >
                  Delete
                </Button>
              </RequirePermission>
            </>
          )}
        />
      </ManageAsyncState>

      <RequirePermission
        all={[SHOP_ADDRESS_PERMISSIONS.SHOP_ADDRESS_READ]}
        fallback={null}
      >
        <p className="text-sm text-muted-foreground">
          Warehouse address options are sourced from your shop address list.
        </p>
      </RequirePermission>
    </ManageSection>
  )
}
