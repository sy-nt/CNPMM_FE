import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { PRODUCT_LIST_DEFAULT_QUERY } from '#/lib/api/product.constants'
import type { ProductListQuery } from '#/lib/api/product'
import { ADMIN_SHOP_LIST_DEFAULT_QUERY } from '#/lib/api/shop.constants'
import { formatPrice } from '#/lib/format'
import { adminShopListQueryOptions } from '#/lib/query/shop'
import { productListQueryOptions } from '#/lib/query/product'
import { cn } from '#/lib/utils'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const PRODUCT_SHOP_FILTER_ALL = 'all' as const

export function PlatformProductsPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const [shopFilter, setShopFilter] = useState<string>(PRODUCT_SHOP_FILTER_ALL)

  const shopsQuery = useQuery(
    adminShopListQueryOptions(accessToken, {
      ...ADMIN_SHOP_LIST_DEFAULT_QUERY,
      status: undefined,
    }),
  )

  const listQuery = useMemo((): ProductListQuery => {
    if (shopFilter === PRODUCT_SHOP_FILTER_ALL) {
      return PRODUCT_LIST_DEFAULT_QUERY
    }
    return { ...PRODUCT_LIST_DEFAULT_QUERY, shopId: shopFilter }
  }, [shopFilter])

  const productsQuery = useQuery(
    productListQueryOptions(accessToken, listQuery),
  )

  const shopOptions = shopsQuery.data?.items ?? []

  return (
    <ManageSection
      title="Products"
      description="Read-only product overview for manager operations."
      actions={
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-shop-filter" className="text-xs">
            Filter by shop
          </Label>
          <select
            id="product-shop-filter"
            value={shopFilter}
            onChange={(event) => setShopFilter(event.target.value)}
            className={cn(
              'h-9 rounded-md border border-input bg-background px-3 text-sm',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            )}
          >
            <option value={PRODUCT_SHOP_FILTER_ALL}>All shops</option>
            {shopOptions.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <ManageAsyncState
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        isEmpty={(productsQuery.data?.items.length ?? 0) === 0}
        emptyTitle="No products found"
        emptyDescription="Products will appear here once published."
      >
        <div className="grid gap-4">
          {productsQuery.data?.items.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-base">{product.name}</CardTitle>
                <CardDescription>{product.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Price: {formatPrice(product.price) ?? product.price}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sold: {product.soldCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Shop: {product.shopId}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ManageAsyncState>
    </ManageSection>
  )
}
