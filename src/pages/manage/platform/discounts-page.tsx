import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Percent } from 'lucide-react'
import { toast } from 'sonner'

import { ManageActionDialog } from '#/components/manage/manage-action-dialog'
import { ManageDataTable } from '#/components/manage/manage-data-table'
import { ManageDetailDialog } from '#/components/manage/manage-detail-dialog'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { formatDiscountValue } from '#/lib/api/discount.constants'
import {
  createGlobalDiscount,
  deleteAdminDiscount,
  listAdminDiscounts,
  updateAdminDiscount,
} from '#/lib/api/discount'
import { formatDateTime } from '#/lib/datetime'
import {
  DISCOUNT_TYPES,
  DISCOUNT_VALUE_TYPES,
  discountListResponseSchema,
} from '#/lib/schemas/discount.schema'
import type { PlatformDiscount } from '#/lib/schemas/discount.schema'
import { DISCOUNT_PERMISSIONS } from '#/lib/rbac/constants'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'
import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'

type DiscountFormState = {
  name: string
  code: string
  description: string
  value: string
  valueType: string
  discountType: string
}

const INITIAL_FORM: DiscountFormState = {
  name: '',
  code: '',
  description: '',
  value: '',
  valueType: DISCOUNT_VALUE_TYPES.PERCENTAGE,
  discountType: DISCOUNT_TYPES.ITEMS,
}

const ADMIN_DISCOUNT_QUERY_KEY = ['admin-discounts'] as const

type DialogMode = 'create' | 'edit' | null

export function DiscountsPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [form, setForm] = useState<DiscountFormState>(INITIAL_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailDiscount, setDetailDiscount] = useState<PlatformDiscount | null>(
    null,
  )
  const { page, setPage } = useManageTablePage()

  const discountsQuery = useQuery({
    queryKey: [...ADMIN_DISCOUNT_QUERY_KEY, accessToken, page],
    queryFn: async ({ signal }) => {
      const raw = await listAdminDiscounts(
        accessToken,
        { page, limit: MANAGE_TABLE_PAGE_SIZE },
        signal,
      )
      return discountListResponseSchema.parse(raw)
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof createGlobalDiscount>[1]) =>
      createGlobalDiscount(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_DISCOUNT_QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      discountId,
      input,
    }: {
      discountId: string
      input: Parameters<typeof updateAdminDiscount>[2]
    }) => updateAdminDiscount(accessToken, discountId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_DISCOUNT_QUERY_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (discountId: string) => deleteAdminDiscount(accessToken, discountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_DISCOUNT_QUERY_KEY })
    },
  })

  const rows = discountsQuery.data?.items ?? []
  const totalPage = discountsQuery.data?.totalPage ?? 1

  const openCreate = (): void => {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setDialogMode('create')
  }

  const openEdit = (discount: PlatformDiscount): void => {
    setForm({
      name: discount.name,
      code: discount.code ?? '',
      description: discount.description ?? '',
      value: discount.value,
      valueType: discount.valueType,
      discountType: discount.discountType,
    })
    setEditingId(discount.id)
    setDialogMode('edit')
  }

  const closeDialog = (): void => {
    setDialogMode(null)
    setEditingId(null)
    setForm(INITIAL_FORM)
  }

  const handleSave = async (): Promise<void> => {
    const name = form.name.trim()
    const code = form.code.trim()
    const value = form.value.trim()
    if (!name || !code || !value) {
      toast.error('Name, code, and value are required.')
      return
    }

    const payload = {
      name,
      code,
      description: form.description.trim() || undefined,
      value,
      valueType: form.valueType as 'percentage' | 'fixed',
      discountType: form.discountType as 'items' | 'delivery',
      scope: 'global' as const,
    }

    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync({ ...payload, isActive: true })
        toast.success('Discount created.')
      } else if (dialogMode === 'edit' && editingId) {
        await updateMutation.mutateAsync({
          discountId: editingId,
          input: payload,
        })
        toast.success('Discount updated.')
      }
      closeDialog()
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not save discount.'))
    }
  }

  const handleDelete = async (discountId: string): Promise<void> => {
    if (deleteMutation.isPending) return
    try {
      await deleteMutation.mutateAsync(discountId)
      toast.success('Discount deleted.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not delete discount.'))
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <ManageSection
      title="Discounts"
      description="Manage platform-wide discount campaigns."
      actions={
        <RequirePermission all={[DISCOUNT_PERMISSIONS.DISCOUNT_CREATE]}>
          <Button type="button" size="sm" onClick={openCreate}>
            Create discount
          </Button>
        </RequirePermission>
      }
    >
      <ManageAsyncState
        isLoading={discountsQuery.isLoading}
        isError={discountsQuery.isError}
        isEmpty={rows.length === 0}
        emptyTitle="No discounts found"
        emptyDescription="Create one to start your first campaign."
      >
        <ManageDataTable<PlatformDiscount>
          columns={[
            { id: 'name', header: 'Name', cell: (row) => row.name },
            { id: 'code', header: 'Code', cell: (row) => row.code ?? '—' },
            {
              id: 'value',
              header: 'Value',
              cell: (row) =>
                formatDiscountValue(
                  row.value,
                  row.valueType,
                  row.maxDiscountAmount,
                ),
            },
            {
              id: 'type',
              header: 'Type',
              cell: (row) => (
                <Badge variant="outline">{row.discountType}</Badge>
              ),
            },
            {
              id: 'validUntil',
              header: 'Valid until',
              cell: (row) => formatDateTime(row.validUntil) ?? 'No expiry',
            },
          ]}
          rows={rows}
          getRowKey={(row) => row.id}
          pagination={{ page, totalPage, onPageChange: setPage }}
          onRowClick={(row) => setDetailDiscount(row)}
          actions={(row) => (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetailDiscount(row)}
              >
                View
              </Button>
              <RequirePermission all={[DISCOUNT_PERMISSIONS.DISCOUNT_UPDATE]}>
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  Edit
                </Button>
              </RequirePermission>
              <RequirePermission all={[DISCOUNT_PERMISSIONS.DISCOUNT_DELETE]}>
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
        title={dialogMode === 'create' ? 'Create discount' : 'Edit discount'}
        confirmLabel={dialogMode === 'create' ? 'Create' : 'Save'}
        onConfirm={() => void handleSave()}
        confirmPending={isSaving}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="discount-name">Name</Label>
            <Input
              id="discount-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-code">Code</Label>
            <Input
              id="discount-code"
              value={form.code}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, code: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-value">Value</Label>
            <Input
              id="discount-value"
              value={form.value}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, value: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="discount-description">Description</Label>
            <Input
              id="discount-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-value-type">Value type</Label>
            <select
              id="discount-value-type"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.valueType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, valueType: event.target.value }))
              }
            >
              <option value={DISCOUNT_VALUE_TYPES.PERCENTAGE}>Percentage</option>
              <option value={DISCOUNT_VALUE_TYPES.FIXED}>Fixed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-discount-type">Discount type</Label>
            <select
              id="discount-discount-type"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.discountType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  discountType: event.target.value,
                }))
              }
            >
              <option value={DISCOUNT_TYPES.ITEMS}>Items</option>
              <option value={DISCOUNT_TYPES.DELIVERY}>Delivery</option>
            </select>
          </div>
        </div>
      </ManageActionDialog>

      <ManageDetailDialog
        open={detailDiscount !== null}
        onOpenChange={(open) => {
          if (!open) setDetailDiscount(null)
        }}
        title={detailDiscount?.name ?? 'Discount'}
        description="Platform discount configuration"
        icon={<Percent className="size-5 text-primary" />}
        badge={
          detailDiscount ? (
            <Badge variant="secondary">{detailDiscount.discountType}</Badge>
          ) : null
        }
        sections={
          detailDiscount
            ? [
                {
                  title: 'Offer',
                  fields: [
                    {
                      label: 'Code',
                      value: detailDiscount.code ?? '—',
                      variant: detailDiscount.code ? 'mono' : 'default',
                      copyValue: detailDiscount.code ?? undefined,
                    },
                    {
                      label: 'Value',
                      value: formatDiscountValue(
                        detailDiscount.value,
                        detailDiscount.valueType,
                        detailDiscount.maxDiscountAmount,
                      ),
                    },
                    {
                      label: 'Type',
                      value: detailDiscount.discountType,
                      variant: 'badge',
                    },
                  ],
                },
                {
                  title: 'Details',
                  fields: [
                    {
                      label: 'Description',
                      value: detailDiscount.description || '—',
                    },
                    {
                      label: 'Valid until',
                      value:
                        formatDateTime(detailDiscount.validUntil) ??
                        'No expiry',
                    },
                  ],
                },
              ]
            : []
        }
      />
    </ManageSection>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
