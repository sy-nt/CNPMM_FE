import { useState } from 'react'
import { Loader2, MapPin, Pencil, Star, Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import type {
  AddressFormInput,
  PersonalAddress,
} from '#/lib/schemas/address.schema'
import { AddressForm } from '#/pages/me/address-form'

type AddressCardProps = {
  address: PersonalAddress
  isEditing: boolean
  onEditToggle: (next: boolean) => void
  onSave: (values: AddressFormInput) => Promise<void>
  onDelete: () => Promise<void>
  errorMessage?: string | null
}

export function AddressCard({
  address,
  isEditing,
  onEditToggle,
  onSave,
  onDelete,
  errorMessage,
}: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const initialValues: AddressFormInput = {
    name: address.name,
    addressLine: address.addressLine,
    city: address.city,
    district: address.district,
    state: address.state,
    country: address.country,
    latitude: address.latitude ?? '',
    longitude: address.longitude ?? '',
    isPrimary: Boolean(address.isPrimary),
  }

  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="size-4 text-primary" />
          {address.name}
          {address.isPrimary ? (
            <span
              className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              aria-label="Primary address"
            >
              <Star aria-hidden="true" className="size-3" />
              Primary
            </span>
          ) : null}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {address.addressLine}
          <br />
          {address.district}, {address.city}, {address.state}, {address.country}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <AddressForm
            initialValues={initialValues}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            onSubmit={onSave}
            onCancel={() => onEditToggle(false)}
            errorMessage={errorMessage}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEditToggle(true)}
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Trash2 aria-hidden="true" />
              )}
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
