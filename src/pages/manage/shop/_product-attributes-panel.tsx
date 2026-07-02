import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { productMutations } from '#/lib/query/product'
import { PRODUCT_PERMISSIONS } from '#/lib/rbac/constants'
import type { ProductAttribute } from '#/lib/schemas/product.schema'

type ProductAttributesPanelProps = {
  accessToken: string
  queryClient: QueryClient
  productId: string
  attributes: ReadonlyArray<ProductAttribute>
  onChanged: () => Promise<void>
}

export function ProductAttributesPanel({
  accessToken,
  queryClient,
  productId,
  attributes,
  onChanged,
}: ProductAttributesPanelProps): ReactNode {
  const mutations = productMutations(accessToken, queryClient)
  const [attributeName, setAttributeName] = useState('')
  const [initialValues, setInitialValues] = useState('')
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({})

  const addAttributeMutation = useMutation({
    ...mutations.addAttribute,
    onSuccess: async () => {
      await onChanged()
      setAttributeName('')
      setInitialValues('')
      toast.success('Attribute created.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not create attribute.'))
    },
  })

  const deleteAttributeMutation = useMutation({
    ...mutations.deleteAttribute,
    onSuccess: async () => {
      await onChanged()
      toast.success('Attribute deleted.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not delete attribute.'))
    },
  })

  const addValueMutation = useMutation({
    ...mutations.addAttributeValue,
    onSuccess: async () => {
      await onChanged()
      toast.success('Attribute value added.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not add attribute value.'))
    },
  })

  const deleteValueMutation = useMutation({
    ...mutations.deleteAttributeValue,
    onSuccess: async () => {
      await onChanged()
      toast.success('Attribute value removed.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not delete attribute value.'))
    },
  })

  const handleCreateAttribute = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const name = attributeName.trim()
    if (!name) {
      toast.error('Attribute name is required.')
      return
    }

    const values = initialValues
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((value, index) => ({ value, displayOrder: index }))

    addAttributeMutation.mutate({
      productId,
      input: {
        name,
        displayOrder: attributes.length,
        values: values.length > 0 ? values : undefined,
      },
    })
  }

  const handleAddValue = (attributeId: string): void => {
    const value = (valueDrafts[attributeId] ?? '').trim()
    if (!value) {
      toast.error('Value is required.')
      return
    }

    addValueMutation.mutate({
      attributeId,
      input: {
        value,
        displayOrder:
          attributes.find((entry) => entry.id === attributeId)?.values.length ??
          0,
      },
    })
    setValueDrafts((prev) => ({ ...prev, [attributeId]: '' }))
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Attributes define variant axes (Color, Size, …). Create them on the
          SPU first, then map SKUs to specific values.
        </p>
        <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}>
          <form className="space-y-3" onSubmit={handleCreateAttribute}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-attribute-name">Attribute name</Label>
                <Input
                  id="new-attribute-name"
                  value={attributeName}
                  onChange={(event) => setAttributeName(event.target.value)}
                  placeholder="Color"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-attribute-values">
                  Initial values (comma-separated)
                </Label>
                <Input
                  id="new-attribute-values"
                  value={initialValues}
                  onChange={(event) => setInitialValues(event.target.value)}
                  placeholder="Black, White, Blue"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={addAttributeMutation.isPending}
            >
              <Plus className="size-4" />
              Add attribute
            </Button>
          </form>
        </RequirePermission>
      </div>

      {attributes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No attributes yet. Add at least one before creating SKUs.
        </p>
      ) : (
        <div className="space-y-3">
          {attributes.map((attribute) => (
            <article
              key={attribute.id}
              className="rounded-xl border border-border/70 bg-card/70 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium text-foreground">{attribute.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Order {attribute.displayOrder}
                  </p>
                </div>
                <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={deleteAttributeMutation.isPending}
                    onClick={() => deleteAttributeMutation.mutate(attribute.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </RequirePermission>
              </div>

              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => (
                  <div
                    key={value.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-1"
                  >
                    <Badge variant="secondary">{value.value}</Badge>
                    <RequirePermission
                      all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}
                    >
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Delete ${value.value}`}
                        disabled={deleteValueMutation.isPending}
                        onClick={() => deleteValueMutation.mutate(value.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </RequirePermission>
                  </div>
                ))}
              </div>

              <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <div className="min-w-[180px] flex-1 space-y-2">
                    <Label htmlFor={`value-${attribute.id}`}>Add value</Label>
                    <Input
                      id={`value-${attribute.id}`}
                      value={valueDrafts[attribute.id] ?? ''}
                      onChange={(event) =>
                        setValueDrafts((prev) => ({
                          ...prev,
                          [attribute.id]: event.target.value,
                        }))
                      }
                      placeholder="New option"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={addValueMutation.isPending}
                    onClick={() => handleAddValue(attribute.id)}
                  >
                    Add value
                  </Button>
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
