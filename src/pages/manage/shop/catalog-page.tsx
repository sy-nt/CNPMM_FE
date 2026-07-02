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
import { listCategories } from '#/lib/api/category'
import type { CreateCategoryInput } from '#/lib/api/shop-category'
import { categoryKeys } from '#/lib/query/keys'
import { shopCategoryMutations } from '#/lib/query/shop-category'
import { SHOP_CATALOG_PERMISSIONS } from '#/lib/rbac/constants'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

type CategoryFormState = CreateCategoryInput

const _EMPTY_FORM: CategoryFormState = {
  name: '',
  description: '',
  parentId: null,
}

export function ShopCatalogPage() {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CategoryFormState>(_EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const mutations = shopCategoryMutations(accessToken, queryClient)

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.list(accessToken, {}),
    queryFn: ({ signal }) => listCategories(accessToken, {}, signal),
  })

  const createMutation = useMutation({
    ...mutations.create,
    onSuccess: () => {
      toast.success('Category created.')
      setForm(_EMPTY_FORM)
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not create category.'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    ...mutations.update,
    onSuccess: () => {
      toast.success('Category updated.')
      setEditingId(null)
      setForm(_EMPTY_FORM)
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not update category.'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    ...mutations.delete,
    onSuccess: () => {
      toast.success('Category deleted.')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not delete category.'
      toast.error(message)
    },
  })

  const categories = categoriesQuery.data ?? []

  return (
    <ManageSection
      title="Shop catalog"
      description="Create and maintain categories used by shop products."
    >
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit category' : 'Create category'}</CardTitle>
          <CardDescription>
            Use parent IDs to build nested category structures.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Category name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
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
          <div className="space-y-2">
            <Label htmlFor="category-parent-id">Parent category ID</Label>
            <Input
              id="category-parent-id"
              value={form.parentId ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  parentId: event.target.value.trim() || null,
                }))
              }
              placeholder="Optional parent id"
            />
          </div>
          <RequirePermission
            all={[
              editingId
                ? SHOP_CATALOG_PERMISSIONS.SHOP_CATALOG_UPDATE
                : SHOP_CATALOG_PERMISSIONS.SHOP_CATALOG_CREATE,
            ]}
          >
            <Button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                const payload: CreateCategoryInput = {
                  name: form.name.trim(),
                  description: form.description?.trim() || undefined,
                  parentId: form.parentId?.trim() || null,
                }
                if (editingId) {
                  updateMutation.mutate({ categoryId: editingId, input: payload })
                  return
                }
                createMutation.mutate(payload)
              }}
            >
              {editingId ? 'Save category' : 'Create category'}
            </Button>
          </RequirePermission>
        </CardContent>
      </Card>

      <ManageAsyncState
        isLoading={categoriesQuery.isLoading}
        isError={categoriesQuery.isError}
        isEmpty={categories.length === 0}
        emptyTitle="No categories"
        emptyDescription="Create categories to organize your catalog."
      >
        <div className="space-y-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-base">{category.name}</CardTitle>
                <CardDescription>
                  {category.description ?? 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <RequirePermission
                  all={[SHOP_CATALOG_PERMISSIONS.SHOP_CATALOG_UPDATE]}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(category.id)
                      setForm({
                        name: category.name,
                        description: category.description ?? '',
                        parentId: category.parentId ?? null,
                      })
                    }}
                  >
                    Edit
                  </Button>
                </RequirePermission>
                <RequirePermission
                  all={[SHOP_CATALOG_PERMISSIONS.SHOP_CATALOG_DELETE]}
                >
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(category.id)}
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
