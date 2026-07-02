import { useState } from 'react'
import { ChevronDown, TicketPercent } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  formatDiscountType,
  formatDiscountValue,
  getPlatformDiscountCode,
  resolveDiscountDetails,
} from '#/lib/api/discount.constants'
import { formatDateTime } from '#/lib/datetime'
import type { DiscountClaim } from '#/lib/schemas/discount.schema'
import { cn } from '#/lib/utils'

type DiscountClaimCardProps = {
  claim: DiscountClaim
}

export function DiscountClaimCard({ claim }: DiscountClaimCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const discount = resolveDiscountDetails(claim)
  const claimedAtLabel = formatDateTime(claim.claimedAt)
  const typeLabel = formatDiscountType(discount.discountType)
  const valueLabel = formatDiscountValue(
    discount.value,
    discount.valueType,
    discount.maxDiscountAmount,
  )

  const handleToggle = (): void => {
    setIsExpanded((current) => !current)
  }

  return (
    <Card className="overflow-hidden transition-[box-shadow,border-color] duration-200 hover:border-primary/25 hover:shadow-lg">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <TicketPercent aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base">{discount.name}</CardTitle>
            {claimedAtLabel ? (
              <CardDescription>Claimed {claimedAtLabel}</CardDescription>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{getPlatformDiscountCode(discount)}</Badge>
          <Badge variant="secondary">{typeLabel}</Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? 'Hide discount details' : 'Show discount details'
            }
            onClick={handleToggle}
          >
            Details
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'size-4 transition-transform',
                isExpanded && 'rotate-180',
              )}
            />
          </Button>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="space-y-4 border-t border-border pt-4">
          <p className="text-lg font-semibold text-primary">{valueLabel}</p>

          {discount.description ? (
            <p className="text-sm text-muted-foreground">
              {discount.description}
            </p>
          ) : null}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Claim ID</dt>
              <dd className="font-mono text-xs text-foreground">{claim.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Discount ID</dt>
              <dd className="font-mono text-xs text-foreground">
                {discount.id}
              </dd>
            </div>
            {discount.validUntil ? (
              <div>
                <dt className="text-muted-foreground">Valid until</dt>
                <dd>{formatDateTime(discount.validUntil) ?? '—'}</dd>
              </div>
            ) : null}
            {discount.validFrom ? (
              <div>
                <dt className="text-muted-foreground">Valid from</dt>
                <dd>{formatDateTime(discount.validFrom) ?? '—'}</dd>
              </div>
            ) : null}
          </dl>

          <p className="text-xs text-muted-foreground">
            Apply this discount during checkout before placing your order.
          </p>
        </CardContent>
      ) : null}
    </Card>
  )
}
