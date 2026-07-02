import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ManageActionDialog } from '#/components/manage/manage-action-dialog'
import { ManageDataTable } from '#/components/manage/manage-data-table'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import type { CreateAddressInput } from '#/lib/api/address'
import { ApiError } from '#/lib/api/client'
import type { PersonalAddress } from '#/lib/schemas/address.schema'
import { SHOP_ADDRESS_PERMISSIONS } from '#/lib/rbac/constants'
import {
  shopAddressListQueryOptions,
  shopAddressMutations,
} from '#/lib/query/address'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { paginateItems } from '#/pages/manage/_paginate-items'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'

type AddressFormState = CreateAddressInput

const _EMPTY_FORM: AddressFormState = {
  name: '',
  addressLine: '',
  city: '',
  district: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  isPrimary: false,
}

type DialogMode = 'create' | 'edit' | null

function _normalizeAddressInput(input: AddressFormState): CreateAddressInput {
  return {
    name: input.name.trim(),
    addressLine: input.addressLine.trim(),
    city: input.city.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    country: input.country.trim(),
    latitude: input.latitude?.trim() || undefined,
    longitude: input.longitude?.trim() || undefined,
    isPrimary: input.isPrimary,
  }
}

function _toFormState(address: PersonalAddress): AddressFormState {
  return {
    name: address.name,
    addressLine: address.addressLine,
    city: address.city,
    district: address.district,
    state: address.state,
    country: address.country,
    latitude: address.latitude ?? '',
    longitude: address.longitude ?? '',
    isPrimary: address.isPrimary ?? false,
  }
}

export function ShopAddressesPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [form, setForm] = useState<AddressFormState>(_EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { page, setPage } = useManageTablePage()

  const addressesQuery = useQuery(shopAddressListQueryOptions(accessToken))
  const mutations = shopAddressMutations(accessToken, queryClient)
  const createMutation = useMutation(mutations.create)
  const updateMutation = useMutation(mutations.update)
  const deleteMutation = useMutation(mutations.delete)

  const allRows = addressesQuery.data ?? []
  const { items: rows, totalPage } = paginateItems(allRows, page)

  const openCreate = (): void => {
    setForm(_EMPTY_FORM)
    setEditingId(null)
    setDialogMode('create')
  }

  const openEdit = (address: PersonalAddress): void => {
    setForm(_toFormState(address))
    setEditingId(address.id)
    setDialogMode('edit')
  }

  const closeDialog = (): void => {
    setDialogMode(null)
    setEditingId(null)
    setForm(_EMPTY_FORM)
  }

  const handleSave = async (): Promise<void> => {
    const payload = _normalizeAddressInput(form)
    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync(payload)
        toast.success('Address created.')
      } else if (dialogMode === 'edit' && editingId) {
        await updateMutation.mutateAsync({
          shopAddressId: editingId,
          input: payload,
        })
        toast.success('Address updated.')
      }
      closeDialog()
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not save address.'))
    }
  }

  const handleDelete = async (addressId: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(addressId)
      toast.success('Address removed.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not delete address.'))
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <ManageSection
      title="Shop addresses"
      description="Manage pickup and fulfillment addresses for your shop."
      actions={
        <RequirePermission all={[SHOP_ADDRESS_PERMISSIONS.SHOP_ADDRESS_CREATE]}>
          <Button type="button" size="sm" onClick={openCreate}>
            Add address
          </Button>
        </RequirePermission>
      }
    >
      <ManageAsyncState
        isLoading={addressesQuery.isLoading}
        isError={addressesQuery.isError}
        isEmpty={allRows.length === 0}
        emptyTitle="No shop addresses"
        emptyDescription="Create your first shop address to start managing logistics."
      >
        <ManageDataTable<PersonalAddress>
          columns={[
            { id: 'name', header: 'Name', cell: (row) => row.name },
            {
              id: 'address',
              header: 'Address',
              className: 'max-w-md whitespace-normal',
              cell: (row) =>
                `${row.addressLine}, ${row.district}, ${row.city}, ${row.state}, ${row.country}`,
            },
            {
              id: 'primary',
              header: 'Primary',
              cell: (row) => (row.isPrimary ? 'Yes' : 'No'),
            },
          ]}
          rows={rows}
          getRowKey={(row) => row.id}
          pagination={{ page, totalPage, onPageChange: setPage }}
          actions={(row) => (
            <>
              <RequirePermission all={[SHOP_ADDRESS_PERMISSIONS.SHOP_ADDRESS_UPDATE]}>
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  Edit
                </Button>
              </RequirePermission>
              <RequirePermission all={[SHOP_ADDRESS_PERMISSIONS.SHOP_ADDRESS_DELETE]}>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => void handleDelete(row.id)}
                >
                  Delete
                </Button>
              </RequirePermission>
            </>
          )}
        />
      </ManageAsyncState>

      <ManageActionDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        title={dialogMode === 'create' ? 'Add address' : 'Edit address'}
        confirmLabel={dialogMode === 'create' ? 'Create' : 'Save'}
        onConfirm={() => void handleSave()}
        confirmPending={isSaving}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address-name">Name</Label>
            <Input
              id="address-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address-line">Address line</Label>
            <Input
              id="address-line"
              value={form.addressLine}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, addressLine: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-city">City</Label>
            <Input
              id="address-city"
              value={form.city}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, city: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-district">District</Label>
            <Input
              id="address-district"
              value={form.district}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, district: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-state">State</Label>
            <Input
              id="address-state"
              value={form.state}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, state: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-country">Country</Label>
            <Input
              id="address-country"
              value={form.country}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, country: event.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isPrimary ?? false}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isPrimary: event.target.checked }))
              }
            />
            Set as primary shop address
          </label>
        </div>
      </ManageActionDialog>
    </ManageSection>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
