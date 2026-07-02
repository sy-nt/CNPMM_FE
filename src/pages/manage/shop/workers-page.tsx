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
import { ApiError } from '#/lib/api/client'
import { SHOP_STAFF_PERMISSIONS } from '#/lib/rbac/constants'
import { shopWorkerMutations, shopWorkersQueryOptions } from '#/lib/query/shop'
import type { ShopWorker } from '#/lib/schemas/shop-worker.schema'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { paginateItems } from '#/pages/manage/_paginate-items'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'

export function ShopWorkersPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [assignOpen, setAssignOpen] = useState(false)
  const [email, setEmail] = useState('')
  const { page, setPage } = useManageTablePage()

  const workersQuery = useQuery(shopWorkersQueryOptions(accessToken))
  const mutations = shopWorkerMutations(accessToken, queryClient)
  const assignMutation = useMutation(mutations.assign)
  const unassignMutation = useMutation(mutations.unassign)

  const allRows = workersQuery.data ?? []
  const { items: rows, totalPage } = paginateItems(allRows, page)

  const handleAssign = async (): Promise<void> => {
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      toast.error('Email is required.')
      return
    }
    try {
      await assignMutation.mutateAsync({ email: normalized })
      toast.success('Worker assigned.')
      setEmail('')
      setAssignOpen(false)
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not assign worker.'))
    }
  }

  const handleUnassign = async (worker: ShopWorker): Promise<void> => {
    if (unassignMutation.isPending) return
    try {
      await unassignMutation.mutateAsync({ email: worker.email })
      toast.success('Worker unassigned.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not unassign worker.'))
    }
  }

  return (
    <ManageSection
      title="Shop workers"
      description="Assign and manage staff for your shop."
      actions={
        <RequirePermission all={[SHOP_STAFF_PERMISSIONS.SHOP_STAFF_ASSIGN]}>
          <Button type="button" size="sm" onClick={() => setAssignOpen(true)}>
            Assign worker
          </Button>
        </RequirePermission>
      }
    >
      <ManageAsyncState
        isLoading={workersQuery.isLoading}
        isError={workersQuery.isError}
        isEmpty={allRows.length === 0}
        emptyTitle="No workers assigned"
        emptyDescription="Assign staff by email to help manage your shop."
      >
        <ManageDataTable<ShopWorker>
          columns={[
            { id: 'email', header: 'Email', cell: (row) => row.email },
            {
              id: 'name',
              header: 'Name',
              cell: (row) =>
                [row.firstName, row.lastName].filter(Boolean).join(' ') || '—',
            },
            {
              id: 'role',
              header: 'Role',
              cell: (row) => row.role?.name ?? row.roleId,
            },
          ]}
          rows={rows}
          getRowKey={(row) => row.id}
          pagination={{ page, totalPage, onPageChange: setPage }}
          actions={(row) => (
            <RequirePermission all={[SHOP_STAFF_PERMISSIONS.SHOP_STAFF_UNASSIGN]}>
              <Button
                size="sm"
                variant="destructive"
                disabled={unassignMutation.isPending}
                onClick={() => void handleUnassign(row)}
              >
                Unassign
              </Button>
            </RequirePermission>
          )}
        />
      </ManageAsyncState>

      <ManageActionDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title="Assign worker"
        description="The user will be assigned as shop staff for your shop."
        confirmLabel="Assign"
        onConfirm={() => void handleAssign()}
        confirmPending={assignMutation.isPending}
      >
        <div className="space-y-2">
          <Label htmlFor="worker-email">Staff email</Label>
          <Input
            id="worker-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="staff@example.com"
          />
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
