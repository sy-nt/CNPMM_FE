import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { Package, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { ProductImageUploadDropzone } from '#/components/image/product-image-upload-dropzone'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { formatPrice } from '#/lib/format'
import { productMutations } from '#/lib/query/product'
import { warehouseListQueryOptions } from '#/lib/query/warehouse'
import { PRODUCT_PERMISSIONS } from '#/lib/rbac/constants'
import type { ProductAttribute, ProductSku } from '#/lib/schemas/product.schema'
import { WAREHOUSE_LIST_QUERY } from '#/pages/manage/shop/_product-manage.constants'
import { formatSkuSelectionSummary } from '#/pages/manage/shop/_product-selection-labels'
import { cn } from '#/lib/utils'

type ProductSkusPanelProps = {
  accessToken: string
  queryClient: QueryClient
  productId: string
  attributes: ReadonlyArray<ProductAttribute>
  skus: ReadonlyArray<ProductSku>
  onChanged: () => Promise<void>
}

type SkuDraft = {
  skuCode: string
  name: string
  price: string
  imageKey?: string
  selections: Record<string, string>
}

const _EMPTY_SKU_DRAFT: SkuDraft = {
  skuCode: '',
  name: '',
  price: '',
  imageKey: undefined,
  selections: {},
}

export function ProductSkusPanel({
  accessToken,
  queryClient,
  productId,
  attributes,
  skus,
  onChanged,
}: ProductSkusPanelProps): ReactNode {
  const mutations = productMutations(accessToken, queryClient)
  const warehousesQuery = useQuery(
    warehouseListQueryOptions(accessToken, WAREHOUSE_LIST_QUERY),
  )
  const [draft, setDraft] = useState<SkuDraft>(_EMPTY_SKU_DRAFT)
  const [inventoryDrafts, setInventoryDrafts] = useState<
    Record<string, { warehouseId: string; quantity: string }>
  >({})

  const attributesWithValues = useMemo(
    () => attributes.filter((attribute) => attribute.values.length > 0),
    [attributes],
  )

  const addSkuMutation = useMutation({
    ...mutations.addSku,
    onSuccess: async () => {
      await onChanged()
      setDraft(_EMPTY_SKU_DRAFT)
      toast.success('SKU created.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not create SKU.'))
    },
  })

  const deleteSkuMutation = useMutation({
    ...mutations.deleteSku,
    onSuccess: async () => {
      await onChanged()
      toast.success('SKU deleted.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not delete SKU.'))
    },
  })

  const setInventoryMutation = useMutation({
    ...mutations.setSkuInventory,
    onSuccess: async () => {
      await onChanged()
      toast.success('SKU inventory updated.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not update inventory.'))
    },
  })

  const updateSkuMutation = useMutation({
    ...mutations.updateSku,
    onSuccess: async () => {
      await onChanged()
      toast.success('SKU image updated.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not update SKU image.'))
    },
  })

  const handleCreateSku = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const skuCode = draft.skuCode.trim()
    const name = draft.name.trim()
    const price = draft.price.trim()

    if (!skuCode || !name || !price) {
      toast.error('SKU code, name, and price are required.')
      return
    }

    if (attributesWithValues.length > 0) {
      const missingSelection = attributesWithValues.some(
        (attribute) => !draft.selections[attribute.id],
      )
      if (missingSelection) {
        toast.error('Pick a value for every attribute.')
        return
      }
    }

    addSkuMutation.mutate({
      productId,
      input: {
        skuCode,
        name,
        price,
        imageKey: draft.imageKey,
        isActive: true,
        selections: Object.entries(draft.selections).map(
          ([attributeId, valueId]) => ({ attributeId, valueId }),
        ),
      },
    })
  }

  const handleSetInventory = (skuId: string): void => {
    const inventoryDraft = inventoryDrafts[skuId]
    const warehouseId = inventoryDraft?.warehouseId ?? ''
    const quantity = Number(inventoryDraft?.quantity)

    if (!warehouseId || !Number.isFinite(quantity)) {
      toast.error('Warehouse and quantity are required.')
      return
    }

    setInventoryMutation.mutate({
      skuId,
      input: { warehouseId, quantity },
    })
  }

  const warehouses = warehousesQuery.data?.items ?? []

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          SKUs are sellable variants of the SPU. Each SKU maps to a unique
          combination of attribute values and carries its own price and stock.
        </p>

        {attributesWithValues.length === 0 ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Add attributes with values before creating SKUs, or create a simple
            SKU without variant mapping.
          </p>
        ) : null}

        <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}>
          <form className="space-y-3" onSubmit={handleCreateSku}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sku-code">SKU code</Label>
                <Input
                  id="sku-code"
                  value={draft.skuCode}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      skuCode: event.target.value,
                    }))
                  }
                  placeholder="EB-PRO-BLK"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku-name">Display name</Label>
                <Input
                  id="sku-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Earbuds Pro — Black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku-price">Price</Label>
                <Input
                  id="sku-price"
                  value={draft.price}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, price: event.target.value }))
                  }
                  placeholder="1999000.00"
                />
              </div>
            </div>

            {attributesWithValues.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {attributesWithValues.map((attribute) => (
                  <div key={attribute.id} className="space-y-2">
                    <Label htmlFor={`sku-attr-${attribute.id}`}>
                      {attribute.name}
                    </Label>
                    <select
                      id={`sku-attr-${attribute.id}`}
                      value={draft.selections[attribute.id] ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          selections: {
                            ...prev.selections,
                            [attribute.id]: event.target.value,
                          },
                        }))
                      }
                      className={cn(
                        'h-9 w-full rounded-md border border-input bg-background px-3 text-sm',
                      )}
                    >
                      <option value="">Select {attribute.name}</option>
                      {attribute.values.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : null}

            <ProductImageUploadDropzone
              accessToken={accessToken}
              imageKey={draft.imageKey}
              onImageKeyChange={(imageKey) =>
                setDraft((prev) => ({ ...prev, imageKey }))
              }
              label="SKU image"
              description="Optional variant image. JPG or PNG, max 5 MB."
            />

            <Button type="submit" size="sm" disabled={addSkuMutation.isPending}>
              <Plus className="size-4" />
              Add SKU
            </Button>
          </form>
        </RequirePermission>
      </div>

      {skus.length === 0 ? (
        <p className="text-sm text-muted-foreground">No SKUs yet.</p>
      ) : (
        <div className="space-y-3">
          {skus.map((sku) => (
            <article
              key={sku.id}
              className="rounded-xl border border-border/70 bg-card/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Package className="size-4 text-muted-foreground" />
                    <h4 className="font-medium text-foreground">{sku.skuCode}</h4>
                    <Badge variant={sku.isActive ? 'secondary' : 'outline'}>
                      {sku.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sku.name ?? 'Unnamed variant'}
                  </p>
                  <p className="text-sm">
                    {formatPrice(sku.price ?? '') ?? sku.price ?? '—'} · Stock{' '}
                    {sku.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSkuSelectionSummary(sku.selections, attributes)}
                  </p>
                  <code className="block text-[11px] text-muted-foreground">
                    SKU {sku.id}
                  </code>
                </div>

                <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={deleteSkuMutation.isPending}
                    onClick={() => deleteSkuMutation.mutate(sku.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </RequirePermission>
              </div>

              <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}>
                <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                  <ProductImageUploadDropzone
                    accessToken={accessToken}
                    imageKey={sku.imageKey}
                    defaultImageKey={sku.imageKey}
                    disabled={updateSkuMutation.isPending}
                    onImageKeyChange={(imageKey) => {
                      if (!imageKey || imageKey === sku.imageKey) return
                      updateSkuMutation.mutate({
                        skuId: sku.id,
                        input: { imageKey },
                      })
                    }}
                    label="Variant image"
                    description="Upload or replace the image for this SKU."
                  />
                </div>
                <div className="mt-4 grid gap-2 border-t border-border/60 pt-4 sm:grid-cols-[1fr_120px_auto]">
                  <div className="space-y-2">
                    <Label htmlFor={`warehouse-${sku.id}`}>Warehouse stock</Label>
                    <select
                      id={`warehouse-${sku.id}`}
                      value={inventoryDrafts[sku.id]?.warehouseId ?? ''}
                      onChange={(event) =>
                        setInventoryDrafts((prev) => ({
                          ...prev,
                          [sku.id]: {
                            warehouseId: event.target.value,
                            quantity: prev[sku.id]?.quantity ?? '',
                          },
                        }))
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`qty-${sku.id}`}>Quantity</Label>
                    <Input
                      id={`qty-${sku.id}`}
                      value={inventoryDrafts[sku.id]?.quantity ?? ''}
                      onChange={(event) =>
                        setInventoryDrafts((prev) => ({
                          ...prev,
                          [sku.id]: {
                            warehouseId: prev[sku.id]?.warehouseId ?? '',
                            quantity: event.target.value,
                          },
                        }))
                      }
                      placeholder="100"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={setInventoryMutation.isPending}
                      onClick={() => handleSetInventory(sku.id)}
                    >
                      Set stock
                    </Button>
                  </div>
                </div>
              </RequirePermission>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
