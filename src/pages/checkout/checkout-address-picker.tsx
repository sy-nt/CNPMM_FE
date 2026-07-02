import { Link } from '@tanstack/react-router'
import { MapPin, Plus, Star } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'
import type { PersonalAddressList } from '#/lib/schemas/address.schema'

type CheckoutAddressPickerProps = {
  addresses: PersonalAddressList
  selectedAddressId: string | null
  onSelect: (addressId: string) => void
}

export function CheckoutAddressPicker({
  addresses,
  selectedAddressId,
  onSelect,
}: CheckoutAddressPickerProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Delivery address
          </h2>
          <p className="text-sm text-muted-foreground">
            Where should we ship your order?
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/me/addresses">Manage addresses</Link>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No addresses yet</CardTitle>
            <CardDescription>
              Add a delivery address on your profile before checking out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" asChild>
              <Link to="/me/addresses">
                <Plus aria-hidden="true" />
                Add an address
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id
            return (
              <label
                key={address.id}
                className={cn(
                  'block cursor-pointer rounded-xl border bg-card p-4 transition-colors',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <input
                  type="radio"
                  name="checkout-address"
                  value={address.id}
                  checked={isSelected}
                  onChange={() => onSelect(address.id)}
                  className="sr-only"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin
                      aria-hidden="true"
                      className="size-4 shrink-0 text-primary"
                    />
                    <span className="font-semibold text-foreground">
                      {address.name}
                    </span>
                    {address.isPrimary ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Star aria-hidden="true" className="size-3" />
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {address.addressLine}
                    <br />
                    {address.district}, {address.city}, {address.state},{' '}
                    {address.country}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      )}
    </section>
  )
}
