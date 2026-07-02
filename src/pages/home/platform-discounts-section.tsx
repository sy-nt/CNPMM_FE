import { Link } from '@tanstack/react-router'

import type { PlatformDiscount } from '#/lib/schemas/discount.schema'
import { PlatformDiscountSlider } from '#/pages/home/platform-discount-slider'

type PlatformDiscountsSectionProps = {
  discounts: ReadonlyArray<PlatformDiscount>
  claimedDiscountIds: ReadonlySet<string>
}

export function PlatformDiscountsSection({
  discounts,
  claimedDiscountIds,
}: PlatformDiscountsSectionProps) {
  if (discounts.length === 0) return null

  return (
    <section
      aria-label="Platform discounts"
      className="island-shell space-y-4 rounded-2xl p-4 sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Platform discounts
          </h2>
          <p className="text-sm text-muted-foreground">
            Claim offers from Nexus and apply them at checkout.
          </p>
        </div>
        <Link
          to="/me/discounts"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          View my discounts
        </Link>
      </div>

      <PlatformDiscountSlider
        discounts={discounts}
        claimedDiscountIds={claimedDiscountIds}
      />
    </section>
  )
}
