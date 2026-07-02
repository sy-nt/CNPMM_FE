import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { warehouseListQueryOptions } from '#/lib/query/warehouse'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const WAREHOUSE_LIST_QUERY = {
  page: 1,
  limit: 50,
  orderBy: 'createdAt' as const,
  sort: 'desc' as const,
}

export function PlatformWarehousesPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const warehousesQuery = useQuery(
    warehouseListQueryOptions(accessToken, WAREHOUSE_LIST_QUERY),
  )

  return (
    <ManageSection
      title="Warehouses"
      description="Read-only warehouse list for platform-level visibility."
    >
      <ManageAsyncState
        isLoading={warehousesQuery.isLoading}
        isError={warehousesQuery.isError}
        isEmpty={(warehousesQuery.data?.items.length ?? 0) === 0}
        emptyTitle="No warehouses found"
        emptyDescription="Warehouses will appear after shop setup."
      >
        <div className="grid gap-4">
          {warehousesQuery.data?.items.map((warehouse) => (
            <Card key={warehouse.id}>
              <CardHeader>
                <CardTitle className="text-base">{warehouse.name}</CardTitle>
                <CardDescription>{warehouse.code}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                  {warehouse.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {warehouse.isDefault ? <Badge variant="outline">Default</Badge> : null}
                <span className="text-xs text-muted-foreground">
                  Address ID: {warehouse.addressId}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </ManageAsyncState>
    </ManageSection>
  )
}
