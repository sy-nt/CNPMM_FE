import { getRouteApi, Link } from '@tanstack/react-router'
import { TicketPercent } from 'lucide-react'

import { PaginationNav } from '#/components/pagination/pagination-nav'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { DiscountClaimCard } from '#/pages/me/discount-claim-card'

const _routeApi = getRouteApi('/me/discounts')

export function DiscountsPage() {
  const { claims, page, totalPage } = _routeApi.useLoaderData()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Discounts</h2>
        <p className="text-sm text-muted-foreground">
          Review claimed platform discounts and their eligibility rules.
        </p>
      </div>

      {claims.items.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <TicketPercent aria-hidden="true" className="size-8" />
            </span>
            <CardTitle>No claimed discounts yet</CardTitle>
            <CardDescription>
              Browse platform offers on the home page and claim the ones you
              want to use at checkout.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {claims.items.map((claim) => (
            <DiscountClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}

      {totalPage > 1 ? (
        <PaginationNav
          page={page}
          totalPage={totalPage}
          renderLink={({ page: targetPage, content, ariaLabel }) => (
            <Link
              to="/me/discounts"
              search={{ page: targetPage }}
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
