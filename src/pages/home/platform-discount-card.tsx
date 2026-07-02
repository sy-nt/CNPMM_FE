import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Loader2, TicketPercent } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ApiError } from '#/lib/api/client'
import {
  formatDiscountRule,
  formatDiscountType,
  formatDiscountValue,
  getPlatformDiscountCode,
} from '#/lib/api/discount.constants'
import { discountMutations } from '#/lib/query/discount'
import type { PlatformDiscount } from '#/lib/schemas/discount.schema'
import {
  authStore,
  selectAccessToken,
  selectIsAuthenticated,
} from '#/stores/auth.store'
import { cn } from '#/lib/utils'

type PlatformDiscountCardProps = {
  discount: PlatformDiscount
  isClaimed: boolean
}

export function PlatformDiscountCard({
  discount,
  isClaimed,
}: PlatformDiscountCardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accessToken = useStore(authStore, selectAccessToken)
  const isAuthenticated = useStore(authStore, selectIsAuthenticated)

  const claimMutation = useMutation(
    discountMutations(accessToken ?? '', queryClient).claim,
  )

  const typeLabel = formatDiscountType(discount.discountType)
  const valueLabel = formatDiscountValue(
    discount.value,
    discount.valueType,
    discount.maxDiscountAmount,
  )
  const isPending =
    claimMutation.isPending &&
    claimMutation.variables.discountId === discount.id

  const handleClaim = async (): Promise<void> => {
    if (isClaimed) return

    if (!isAuthenticated || !accessToken) {
      await navigate({ to: '/sign-in' })
      return
    }

    try {
      await claimMutation.mutateAsync({ discountId: discount.id })
      toast.success(`Claimed ${discount.name}. Use it at checkout.`)
    } catch (error) {
      toast.error(_humaniseClaimError(error))
    }
  }

  return (
    <Card className="flex h-full min-h-0 flex-col border-border/80 bg-card/90">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <TicketPercent aria-hidden="true" className="size-5" />
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            {typeLabel ? (
              <Badge variant="secondary">{typeLabel}</Badge>
            ) : null}
            <Badge variant="outline">{getPlatformDiscountCode(discount)}</Badge>
          </div>
        </div>
        <CardTitle className="line-clamp-2 min-h-11 text-base leading-snug">
          {discount.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">
          {discount.description || '\u00a0'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col space-y-2 pb-3">
        <p className="text-lg font-semibold text-primary">{valueLabel}</p>
        <div className="min-h-12 overflow-hidden text-xs text-muted-foreground">
          {discount.rules?.length ? (
            <ul className="space-y-1">
              {discount.rules.map((rule) => {
                const label = formatDiscountRule(rule)
                if (!label) return null
                return <li key={`${rule.type}-${label}`}>{label}</li>
              })}
            </ul>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-auto pt-0">
        <Button
          type="button"
          className={cn('w-full')}
          variant={isClaimed ? 'secondary' : 'default'}
          disabled={isClaimed || isPending}
          onClick={() => void handleClaim()}
        >
          {isPending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Claiming…
            </>
          ) : isClaimed ? (
            'Claimed'
          ) : isAuthenticated ? (
            'Claim discount'
          ) : (
            'Sign in to claim'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function _humaniseClaimError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return 'Sign in to claim this discount.'
    }
    if (error.status === 409) {
      return 'You have already claimed this discount.'
    }
    return error.message || 'Could not claim this discount.'
  }
  return 'Could not claim this discount.'
}
