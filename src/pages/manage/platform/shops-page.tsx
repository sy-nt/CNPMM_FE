import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ManageDataTable } from '#/components/manage/manage-data-table'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { ApiError } from '#/lib/api/client'
import {
  ADMIN_SHOP_LIST_DEFAULT_QUERY,
  SHOP_STATUSES,
} from '#/lib/api/shop.constants'
import { updateShopStatus } from '#/lib/api/shop'
import type { AdminShopListQuery } from '#/lib/api/shop'
import type { ShopListItem } from '#/lib/schemas/shop.schema'
import { SHOP_PERMISSIONS } from '#/lib/rbac/constants'
import { useHasAllPermissions } from '#/lib/rbac/hooks'
import {
  adminShopListQueryOptions,
  invalidateShopQueries,
} from '#/lib/query/shop'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'
import { useManageTablePage } from '#/pages/manage/_use-manage-table-page'
import { MANAGE_TABLE_PAGE_SIZE } from '#/pages/manage/manage-list.constants'

export function ShopsPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const canVerify = useHasAllPermissions([SHOP_PERMISSIONS.SHOP_VERIFY])
  const [showAll, setShowAll] = useState(false)
  const { page, setPage, resetPage } = useManageTablePage()

  const listQuery = useMemo((): AdminShopListQuery => {
    const base = showAll
      ? (() => {
          const { status: _status, ...rest } = ADMIN_SHOP_LIST_DEFAULT_QUERY
          return rest
        })()
      : ADMIN_SHOP_LIST_DEFAULT_QUERY

    return {
      ...base,
      page,
      limit: MANAGE_TABLE_PAGE_SIZE,
    }
  }, [showAll, page])

  const shopsQuery = useQuery(adminShopListQueryOptions(accessToken, listQuery))
  const rows = shopsQuery.data?.items ?? []
  const totalPage = shopsQuery.data?.totalPage ?? 1

  const statusMutation = useMutation({
    mutationFn: ({ shopId, status }: { shopId: string; status: string }) =>
      updateShopStatus(accessToken, { id: shopId, status }),
    onSuccess: async () => {
      await invalidateShopQueries(queryClient)
    },
  })

  const handleStatusChange = async (
    shopId: string,
    status: string,
  ): Promise<void> => {
    if (statusMutation.isPending) return
    try {
      await statusMutation.mutateAsync({ shopId, status })
      toast.success('Shop status updated.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not update shop status.'))
    }
  }

  return (
    <ManageSection
      title="Shop approval"
      description="Review pending shop registrations and approve or reject them."
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAll((prev) => !prev)
            resetPage()
          }}
        >
          {showAll ? 'Show pending only' : 'Show all shops'}
        </Button>
      }
    >
      <ManageAsyncState
        isLoading={shopsQuery.isLoading}
        isError={shopsQuery.isError}
        isEmpty={rows.length === 0}
        emptyTitle={showAll ? 'No shops found' : 'No pending shops'}
        emptyDescription={
          showAll
            ? 'Shops will appear here after registration.'
            : 'All shop registrations have been reviewed.'
        }
      >
        <ManageDataTable<ShopListItem>
          columns={[
            {
              id: 'name',
              header: 'Name',
              cell: (shop) => shop.name,
            },
            {
              id: 'slug',
              header: 'Slug',
              cell: (shop) => shop.slug,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (shop) => (
                <Badge variant="outline">
                  {(shop.status || SHOP_STATUSES.PENDING).toLowerCase()}
                </Badge>
              ),
            },
            {
              id: 'description',
              header: 'Description',
              className: 'max-w-xs whitespace-normal',
              cell: (shop) => shop.description || '—',
            },
          ]}
          rows={rows}
          getRowKey={(shop) => shop.id}
          pagination={{ page, totalPage, onPageChange: setPage }}
          actions={(shop) => {
            const currentStatus = (
              shop.status || SHOP_STATUSES.PENDING
            ).toLowerCase()
            const isPendingAction =
              statusMutation.isPending &&
              statusMutation.variables.shopId === shop.id

            if (!canVerify) {
              return (
                <span className="text-xs text-muted-foreground">Read only</span>
              )
            }

            return (
              <RequirePermission all={[SHOP_PERMISSIONS.SHOP_VERIFY]}>
                <Button
                  size="sm"
                  disabled={
                    isPendingAction || currentStatus === SHOP_STATUSES.ACTIVE
                  }
                  onClick={() =>
                    void handleStatusChange(shop.id, SHOP_STATUSES.ACTIVE)
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={
                    isPendingAction ||
                    currentStatus === SHOP_STATUSES.SUSPENDED
                  }
                  onClick={() =>
                    void handleStatusChange(shop.id, SHOP_STATUSES.SUSPENDED)
                  }
                >
                  Reject
                </Button>
              </RequirePermission>
            )
          }}
        />
      </ManageAsyncState>
    </ManageSection>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
