import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ApiError } from '#/lib/api/client'
import { personalAddressMutations } from '#/lib/query/address'
import type {
  AddressFormInput,
  PersonalAddress,
  PersonalAddressList,
} from '#/lib/schemas/address.schema'
import { AddressForm, EMPTY_ADDRESS_FORM } from '#/pages/me/address-form'
import { AddressCard } from '#/pages/me/address-card'

type AddressesSectionProps = {
  accessToken: string
  addresses: PersonalAddressList
  onChange: () => void | Promise<void>
}

export function AddressesSection({
  accessToken,
  addresses,
  onChange,
}: AddressesSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const mutations = personalAddressMutations(accessToken)
  const createAddress = useMutation(mutations.create)
  const updateAddress = useMutation(mutations.update)
  const deleteAddress = useMutation(mutations.delete)

  const handleCreate = async (values: AddressFormInput): Promise<void> => {
    setCreateError(null)
    try {
      await createAddress.mutateAsync(_toCreateInput(values))
      toast.success('Address added.')
      setIsCreating(false)
      await onChange()
    } catch (error) {
      const message = _humaniseError(error, 'Could not add the address.')
      setCreateError(message)
      toast.error(message)
    }
  }

  const handleEdit = (
    address: PersonalAddress,
  ): ((values: AddressFormInput) => Promise<void>) => {
    return async (values) => {
      setEditError(null)
      try {
        await updateAddress.mutateAsync({
          addressId: address.id,
          input: _toUpdateInput(values, address),
        })
        toast.success('Address updated.')
        setEditingId(null)
        await onChange()
      } catch (error) {
        const message = _humaniseError(error, 'Could not update the address.')
        setEditError(message)
        toast.error(message)
      }
    }
  }

  const handleDelete = (address: PersonalAddress): (() => Promise<void>) => {
    return async () => {
      try {
        await deleteAddress.mutateAsync(address.id)
        toast.success('Address removed.')
        if (editingId === address.id) setEditingId(null)
        await onChange()
      } catch (error) {
        const message = _humaniseError(error, 'Could not remove the address.')
        toast.error(message)
      }
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="display-title text-2xl font-semibold text-foreground">
            Addresses
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage where your orders ship to.
          </p>
        </div>
        {!isCreating ? (
          <Button
            type="button"
            variant="default"
            onClick={() => {
              setIsCreating(true)
              setCreateError(null)
            }}
          >
            <Plus aria-hidden="true" />
            Add address
          </Button>
        ) : null}
      </div>

      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>New address</CardTitle>
            <CardDescription>
              Add a delivery address to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm
              formId="new-address"
              initialValues={EMPTY_ADDRESS_FORM}
              submitLabel="Add address"
              pendingLabel="Adding…"
              onSubmit={handleCreate}
              onCancel={() => {
                setIsCreating(false)
                setCreateError(null)
              }}
              errorMessage={createError}
            />
          </CardContent>
        </Card>
      ) : null}

      {addresses.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            You don&apos;t have any addresses yet.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid items-start gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            isEditing={editingId === address.id}
            onEditToggle={(next) => {
              setEditError(null)
              setEditingId(next ? address.id : null)
            }}
            onSave={handleEdit(address)}
            onDelete={handleDelete(address)}
            errorMessage={editingId === address.id ? editError : null}
          />
        ))}
      </div>
    </section>
  )
}

function _toCreateInput(values: AddressFormInput) {
  const trimmedLat = values.latitude?.trim() ?? ''
  const trimmedLng = values.longitude?.trim() ?? ''
  return {
    name: values.name.trim(),
    addressLine: values.addressLine.trim(),
    city: values.city.trim(),
    district: values.district.trim(),
    state: values.state.trim(),
    country: values.country.trim(),
    isPrimary: values.isPrimary,
    ...(trimmedLat ? { latitude: trimmedLat } : {}),
    ...(trimmedLng ? { longitude: trimmedLng } : {}),
  }
}

/**
 * Diff the form against the current record so the PATCH only sends real
 * changes. The CNPM backend treats absent fields as "leave alone", so this
 * keeps unrelated columns untouched even when the form re-emits them.
 */
function _toUpdateInput(
  values: AddressFormInput,
  current: PersonalAddress,
): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  const nextLat = values.latitude?.trim() ?? ''
  const nextLng = values.longitude?.trim() ?? ''

  if (values.name.trim() !== current.name) next.name = values.name.trim()
  if (values.addressLine.trim() !== current.addressLine) {
    next.addressLine = values.addressLine.trim()
  }
  if (values.city.trim() !== current.city) next.city = values.city.trim()
  if (values.district.trim() !== current.district) {
    next.district = values.district.trim()
  }
  if (values.state.trim() !== current.state) next.state = values.state.trim()
  if (values.country.trim() !== current.country) {
    next.country = values.country.trim()
  }
  if (nextLat !== (current.latitude ?? '')) next.latitude = nextLat
  if (nextLng !== (current.longitude ?? '')) next.longitude = nextLng
  if (values.isPrimary !== Boolean(current.isPrimary)) {
    next.isPrimary = values.isPrimary
  }

  return next
}

function _humaniseError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback
  }
  return fallback
}
