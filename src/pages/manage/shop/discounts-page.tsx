import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
import {
  createShopDiscount,
  deleteShopDiscount,
  listShopDiscounts,
  updateShopDiscount,
} from '#/lib/api/discount'
import type { CreateShopDiscountInput } from '#/lib/api/discount'
import { formatDateTime } from '#/lib/datetime'
import { formatPrice } from '#/lib/format'
import { discountKeys } from '#/lib/query/keys'
import { SHOP_DISCOUNT_PERMISSIONS } from '#/lib/rbac/constants'
import { discountListResponseSchema } from '#/lib/schemas/discount.schema'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const DISCOUNT_LIST_QUERY = {
  page: 1,
  limit: 30,
  sort: 'desc' as const,
}

type DiscountFormState = CreateShopDiscountInput

const _EMPTY_FORM: DiscountFormState = {
  name: '',
  code: '',
  value: '',
  valueType: 'percentage',
  isActive: true,
}

export function ShopDiscountsPage() {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<DiscountFormState>(_EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)

  const discountsQuery = useQuery({
    queryKey: discountKeys.platformList(accessToken, DISCOUNT_LIST_QUERY),
    queryFn: ({ signal }) =>
      listShopDiscounts(accessToken, DISCOUNT_LIST_QUERY, signal),
    select: (data) => discountListResponseSchema.parse(data),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateShopDiscountInput) =>
      createShopDiscount(accessToken, input),
    onSuccess: async () => {
      toast.success('Discount created.')
      setForm(_EMPTY_FORM)
      await queryClient.invalidateQueries({ queryKey: discountKeys.all })
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not create discount.'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: { discountId: string; values: CreateShopDiscountInput }) =>
      updateShopDiscount(accessToken, input.discountId, input.values),
    onSuccess: async () => {
      toast.success('Discount updated.')
      setEditingId(null)
      setForm(_EMPTY_FORM)
      await queryClient.invalidateQueries({ queryKey: discountKeys.all })
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not update discount.'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (discountId: string) => deleteShopDiscount(accessToken, discountId),
    onSuccess: async () => {
      toast.success('Discount deleted.')
      await queryClient.invalidateQueries({ queryKey: discountKeys.all })
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not delete discount.'
      toast.error(message)
    },
  })

  const discounts = discountsQuery.data?.items ?? []

  return (
    <ManageSection
      title="Shop discounts"
      description="Create and manage promotions available in your shop."
    >
      <RequirePermission all={[SHOP_DISCOUNT_PERMISSIONS.SHOP_DISCOUNT_CREATE]}>
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit discount' : 'Create discount'}</CardTitle>
            <CardDescription>
              Define code, value, and active period for your shop campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discount-name">Name</Label>
                <Input
                  id="discount-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Campaign name"
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
                  placeholder="SAVE10"
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
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-type">Value type</Label>
                <select
                  id="discount-type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={form.valueType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      valueType: event.target.value as 'percentage' | 'fixed',
                    }))
                  }
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>
            <Button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                const payload: CreateShopDiscountInput = {
                  name: form.name.trim(),
                  code: form.code.trim(),
                  value: form.value.trim(),
                  valueType: form.valueType,
                  isActive: form.isActive,
                  description: form.description?.trim() || undefined,
                }
                if (editingId) {
                  updateMutation.mutate({ discountId: editingId, values: payload })
                  return
                }
                createMutation.mutate(payload)
              }}
            >
              {editingId ? 'Save discount' : 'Create discount'}
            </Button>
          </CardContent>
        </Card>
      </RequirePermission>

      <ManageAsyncState
        isLoading={discountsQuery.isLoading}
        isError={discountsQuery.isError}
        isEmpty={discounts.length === 0}
        emptyTitle="No discounts found"
        emptyDescription="Create a discount to run your first campaign."
      >
        <div className="space-y-3">
          {discounts.map((discount) => (
            <Card key={discount.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {discount.name} ({discount.code ?? 'N/A'})
                </CardTitle>
                <CardDescription>
                  {discount.valueType === 'fixed'
                    ? formatPrice(discount.value) ?? discount.value
                    : `${discount.value}%`}{' '}
                  · Valid until {formatDateTime(discount.validUntil) ?? 'No limit'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <RequirePermission
                  all={[SHOP_DISCOUNT_PERMISSIONS.SHOP_DISCOUNT_UPDATE]}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(discount.id)
                      setForm({
                        name: discount.name,
                        code: discount.code ?? '',
                        value: discount.value,
                        valueType: discount.valueType,
                        isActive: true,
                        description: discount.description ?? '',
                      })
                    }}
                  >
                    Edit
                  </Button>
                </RequirePermission>
                <RequirePermission
                  all={[SHOP_DISCOUNT_PERMISSIONS.SHOP_DISCOUNT_DELETE]}
                >
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(discount.id)}
                  >
                    Delete
                  </Button>
                </RequirePermission>
              </CardContent>
            </Card>
          ))}
        </div>
      </ManageAsyncState>
    </ManageSection>
  )
}
