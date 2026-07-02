import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Package } from 'lucide-react'

import { PaginationNav } from '#/components/pagination/pagination-nav'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ORDER_STATUS_ALL, ORDER_STATUS_TABS } from '#/lib/api/order.constants'
import { OrderCard } from '#/pages/me/order-card'
import { authStore, selectAccessToken } from '#/stores/auth.store'
import { cn } from '#/lib/utils'

const _routeApi = getRouteApi('/me/orders')

export function OrdersPage() {
  const { orders, page, totalPage, status } = _routeApi.useLoaderData()
  const router = useRouter()
  const accessToken = useStore(authStore, selectAccessToken)

  if (!accessToken) {
    throw new Error('Orders require an authenticated session.')
  }

  const handleOrderChange = (): Promise<void> => router.invalidate()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Orders</h2>
        <p className="text-sm text-muted-foreground">
          View your purchase history and current order status.
        </p>
      </div>

      <nav
        aria-label="Order status"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {ORDER_STATUS_TABS.map((tab) => {
          const isActive = status === tab.value
          return (
            <Link
              key={tab.value}
              to="/me/orders"
              search={{
                status: tab.value === ORDER_STATUS_ALL ? undefined : tab.value,
                page: undefined,
              }}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {orders.items.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <Package aria-hidden="true" className="size-8" />
            </span>
            <CardTitle>
              {status === ORDER_STATUS_ALL
                ? 'No orders yet'
                : `No ${ORDER_STATUS_TABS.find((tab) => tab.value === status)?.label.toLowerCase() ?? ''} orders`}
            </CardTitle>
            <CardDescription>
              {status === ORDER_STATUS_ALL
                ? 'When you place an order, it will show up here.'
                : 'Try another status tab to see more orders.'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.items.map((order) => (
            <OrderCard
              key={order.id}
              accessToken={accessToken}
              order={order}
              onOrderChange={handleOrderChange}
            />
          ))}
        </div>
      )}

      {totalPage > 1 ? (
        <PaginationNav
          page={page}
          totalPage={totalPage}
          renderLink={({ page: targetPage, content, ariaLabel }) => (
            <Link
              to="/me/orders"
              search={{
                page: targetPage,
                status: status === ORDER_STATUS_ALL ? undefined : status,
              }}
              aria-label={ariaLabel}
            >
              {content}
            </Link>
          )}
        />
      ) : null}
    </section>
  )
}
