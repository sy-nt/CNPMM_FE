import { Truck } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'
import { formatDeliveryEta } from '#/pages/checkout/_format-delivery-eta'
import type { DeliveryMethodList } from '#/lib/schemas/delivery.schema'

type CheckoutDeliveryPickerProps = {
  methods: DeliveryMethodList
  selectedMethodId: string | null
  onSelect: (methodId: string) => void
}

export function CheckoutDeliveryPicker({
  methods,
  selectedMethodId,
  onSelect,
}: CheckoutDeliveryPickerProps) {
  const activeMethods = methods.filter((method) => method.isActive)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Shipping method
        </h2>
        <p className="text-sm text-muted-foreground">
          Select how you would like your order delivered.
        </p>
      </div>

      {activeMethods.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No shipping methods available</CardTitle>
            <CardDescription>
              Delivery options are not configured yet. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3">
          {activeMethods.map((method) => {
            const isSelected = selectedMethodId === method.id
            return (
              <label
                key={method.id}
                className={cn(
                  'block cursor-pointer rounded-xl border bg-card p-4 transition-colors',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <input
                  type="radio"
                  name="checkout-delivery-method"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onSelect(method.id)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  >
                    <Truck className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {method.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDeliveryEta(method.etaMinDays, method.etaMaxDays)}
                      </span>
                    </div>
                    {method.description ? (
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      )}
    </section>
  )
}
