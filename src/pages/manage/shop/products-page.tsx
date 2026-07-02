import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PackageSearch } from 'lucide-react'
import { toast } from 'sonner'

import { ManageDataTable } from '#/components/manage/manage-data-table'
import { ProductImageUploadDropzone } from '#/components/image/product-image-upload-dropzone'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Badge } from '#/components/ui/badge'
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
import { listCategories } from '#/lib/api/category'
import type { CreateProductInput } from '#/lib/api/product'
import { formatPrice } from '#/lib/format'
import { shopProductListQueryOptions, productMutations } from '#/lib/query/product'
import { PRODUCT_PERMISSIONS } from '#/lib/rbac/constants'
import type { ProductSummary } from '#/lib/schemas/product.schema'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'
import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'
import { ProductManageDialog } from '#/pages/manage/shop/_product-manage-dialog'
import { PRODUCT_LIST_QUERY } from '#/pages/manage/shop/_product-manage.constants'

type ProductFormState = CreateProductInput

const _EMPTY_FORM: ProductFormState = {
  name: '',
  price: '',
  categoryId: '',
  description: '',
  isActive: true,
}

export function ShopProductsPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ProductFormState>(_EMPTY_FORM)
  const [mainImageKey, setMainImageKey] = useState<string | undefined>()
  const [managedProduct, setManagedProduct] = useState<ProductSummary | null>(
    null,
  )
  const { page, setPage } = useManageTablePage()
  const mutations = productMutations(accessToken, queryClient)

  const productsQuery = useQuery(
    shopProductListQueryOptions(accessToken, {
      ...PRODUCT_LIST_QUERY,
      page,
      limit: MANAGE_TABLE_PAGE_SIZE,
    }),
  )
  const categoriesQuery = useQuery({
    queryKey: ['shop-product-categories', accessToken],
    queryFn: ({ signal }) => listCategories(accessToken, {}, signal),
  })

  const createMutation = useMutation({
    ...mutations.create,
    onSuccess: () => {
      toast.success('SPU created. Open Manage to add attributes and SKUs.')
      setForm(_EMPTY_FORM)
      setMainImageKey(undefined)
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not create product.'))
    },
  })

  const deleteMutation = useMutation({
    ...mutations.delete,
    onSuccess: () => {
      toast.success('Product deleted.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not delete product.'))
    },
  })

  const products = productsQuery.data?.items ?? []
  const totalPage = productsQuery.data?.totalPage ?? 1
  const categories = categoriesQuery.data ?? []

  return (
    <ManageSection
      title="Shop products"
      description="Create SPU shells, then manage attributes and SKUs from the product workspace."
    >
      <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_CREATE]}>
        <Card>
          <CardHeader>
            <CardTitle>Create SPU</CardTitle>
            <CardDescription>
              Start with the product base. Add variant attributes and SKUs after
              creation via Manage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Wireless Earbuds Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Base price</Label>
                <Input
                  id="product-price"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  placeholder="1999000.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <select
                id="product-category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={form.categoryId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Input
                id="product-description"
                value={form.description ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional description"
              />
            </div>
            <ProductImageUploadDropzone
              accessToken={accessToken}
              imageKey={mainImageKey}
              onImageKeyChange={setMainImageKey}
              label="Main product image"
            />
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                const payload: CreateProductInput = {
                  name: form.name.trim(),
                  price: form.price.trim(),
                  categoryId: form.categoryId.trim(),
                  description: form.description?.trim() || undefined,
                  isActive: form.isActive,
                  mainImageKey: mainImageKey,
                }
                createMutation.mutate(payload)
              }}
            >
              Create SPU
            </Button>
          </CardContent>
        </Card>
      </RequirePermission>

      <ManageAsyncState
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        isEmpty={products.length === 0}
        emptyTitle="No products found"
        emptyDescription="Create your first SPU to start building variants."
      >
        <ManageDataTable
          columns={[
            { id: 'name', header: 'SPU', cell: (product) => product.name },
            {
              id: 'price',
              header: 'Base price',
              cell: (product) => formatPrice(product.price) ?? product.price,
            },
            {
              id: 'sold',
              header: 'Sold',
              cell: (product) => (
                <Badge variant="secondary">{product.soldCount}</Badge>
              ),
            },
          ]}
          rows={products}
          getRowKey={(product) => product.id}
          pagination={{ page, totalPage, onPageChange: setPage }}
          actions={(product) => (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManagedProduct(product)}
              >
                <PackageSearch className="size-4" />
                Manage
              </Button>
              <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_DELETE]}>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(product.id)}
                >
                  Delete
                </Button>
              </RequirePermission>
            </>
          )}
        />
      </ManageAsyncState>

      <ProductManageDialog
        accessToken={accessToken}
        product={managedProduct}
        open={managedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setManagedProduct(null)
        }}
      />
    </ManageSection>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
