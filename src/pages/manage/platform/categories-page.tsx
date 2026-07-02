import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderTree } from 'lucide-react'
import { toast } from 'sonner'

import { ManageActionDialog } from '#/components/manage/manage-action-dialog'
import { ManageDataTable } from '#/components/manage/manage-data-table'
import { ManageDetailDialog } from '#/components/manage/manage-detail-dialog'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { CATEGORY_LIST_DEFAULT_QUERY } from '#/lib/api/category.constants'
import type { Category } from '#/lib/schemas/category.schema'
import { CATEGORY_PERMISSIONS } from '#/lib/rbac/constants'
import { categoryListQueryOptions } from '#/lib/query/category'
import { adminCategoryMutations } from '#/lib/query/admin-category'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { paginateItems } from '#/pages/manage/_paginate-items'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'

type CategoryFormState = {
  name: string
  description: string
}

const INITIAL_FORM: CategoryFormState = {
  name: '',
  description: '',
}

type DialogMode = 'create' | 'edit' | null

export function CategoriesPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [form, setForm] = useState<CategoryFormState>(INITIAL_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailCategory, setDetailCategory] = useState<Category | null>(null)
  const { page, setPage } = useManageTablePage()

  const categoriesQuery = useQuery(
    categoryListQueryOptions(accessToken, CATEGORY_LIST_DEFAULT_QUERY),
  )

  const mutations = adminCategoryMutations(accessToken, queryClient)
  const createMutation = useMutation(mutations.create)
  const updateMutation = useMutation(mutations.update)
  const deleteMutation = useMutation(mutations.delete)

  const rootCategories =
    categoriesQuery.data?.filter((item) => !item.parentId) ?? []
  const { items: rows, totalPage } = paginateItems(rootCategories, page)

  const openCreate = (): void => {
    setForm(INITIAL_FORM)
    setEditingId(null)
    setDialogMode('create')
  }

  const openEdit = (category: Category): void => {
    setForm({
      name: category.name,
      description: category.description ?? '',
    })
    setEditingId(category.id)
    setDialogMode('edit')
  }

  const closeDialog = (): void => {
    setDialogMode(null)
    setEditingId(null)
    setForm(INITIAL_FORM)
  }

  const handleSave = async (): Promise<void> => {
    const name = form.name.trim()
    if (!name) {
      toast.error('Category name is required.')
      return
    }

    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync({
          name,
          description: form.description.trim() || undefined,
          parentId: null,
        })
        toast.success('Category created.')
      } else if (dialogMode === 'edit' && editingId) {
        await updateMutation.mutateAsync({
          categoryId: editingId,
          input: {
            name,
            description: form.description.trim() || undefined,
          },
        })
        toast.success('Category updated.')
      }
      closeDialog()
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not save category.'))
    }
  }

  const handleDelete = async (categoryId: string): Promise<void> => {
    if (deleteMutation.isPending) return
    try {
      await deleteMutation.mutateAsync(categoryId)
      toast.success('Category deleted.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not delete category.'))
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <ManageSection
      title="Categories"
      description="Manage platform product taxonomy."
      actions={
        <RequirePermission all={[CATEGORY_PERMISSIONS.CATEGORY_CREATE]}>
          <Button type="button" size="sm" onClick={openCreate}>
            Create category
          </Button>
        </RequirePermission>
      }
    >
      <ManageAsyncState
        isLoading={categoriesQuery.isLoading}
        isError={categoriesQuery.isError}
        isEmpty={rootCategories.length === 0}
        emptyTitle="No root categories"
        emptyDescription="Create categories to organize products."
      >
        <ManageDataTable<Category>
          columns={[
            { id: 'name', header: 'Name', cell: (row) => row.name },
            {
              id: 'description',
              header: 'Description',
              className: 'max-w-md whitespace-normal',
              cell: (row) => row.description || '—',
            },
          ]}
          rows={rows}
          getRowKey={(row) => row.id}
          pagination={{ page, totalPage, onPageChange: setPage }}
          onRowClick={(row) => setDetailCategory(row)}
          actions={(row) => (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetailCategory(row)}
              >
                View
              </Button>
              <RequirePermission all={[CATEGORY_PERMISSIONS.CATEGORY_UPDATE]}>
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  Edit
                </Button>
              </RequirePermission>
              <RequirePermission all={[CATEGORY_PERMISSIONS.CATEGORY_DELETE]}>
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
        title={dialogMode === 'create' ? 'Create category' : 'Edit category'}
        description="Root categories drive storefront navigation."
        confirmLabel={dialogMode === 'create' ? 'Create' : 'Save'}
        onConfirm={() => void handleSave()}
        confirmPending={isSaving}
      >
        <div className="space-y-3">
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
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Optional description"
            />
          </div>
        </div>
      </ManageActionDialog>

      <ManageDetailDialog
        open={detailCategory !== null}
        onOpenChange={(open) => {
          if (!open) setDetailCategory(null)
        }}
        title={detailCategory?.name ?? 'Category'}
        description="Platform category details"
        icon={<FolderTree className="size-5 text-primary" />}
        sections={
          detailCategory
            ? [
                {
                  title: 'Overview',
                  fields: [
                    { label: 'Name', value: detailCategory.name },
                    {
                      label: 'Description',
                      value: detailCategory.description || '—',
                    },
                  ],
                },
                {
                  title: 'Identifiers',
                  fields: [
                    {
                      label: 'Category ID',
                      value: detailCategory.id,
                      variant: 'mono',
                      copyValue: detailCategory.id,
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
