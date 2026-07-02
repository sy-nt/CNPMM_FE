import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Store } from 'lucide-react'
import { toast } from 'sonner'

import { TextField } from '#/components/auth/text-field'
import { ImageUploadDropzone } from '#/components/image/image-upload-dropzone'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { registerShop } from '#/lib/api/shop'
import { SHOP_LOGO_ACCEPT } from '#/lib/api/image.constants'
import { ApiError } from '#/lib/api/client'
import { getMyRole } from '#/lib/api/role'
import type { AddressFormInput } from '#/lib/schemas/address.schema'
import {
  AddressForm,
  EMPTY_ADDRESS_FORM,
} from '#/pages/me/address-form'
import { uploadShopLogo } from '#/lib/upload/shop-logo'
import { authStore, selectAccessToken, setAuthTokens, setMyRole } from '#/stores/auth.store'

export function ShopPage() {
  const router = useRouter()
  const accessToken = useStore(authStore, selectAccessToken)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageKey, setImageKey] = useState<string | undefined>(undefined)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [registeredShopName, setRegisteredShopName] = useState<string | null>(
    null,
  )

  const handleRegister = async (address: AddressFormInput): Promise<void> => {
    if (!accessToken) return
    const trimmedName = name.trim()
    if (!trimmedName) {
      setSubmitError('Shop name is required.')
      return
    }

    setSubmitError(null)
    try {
      const result = await registerShop(accessToken, {
        name: trimmedName,
        description: description.trim() || undefined,
        imageKey: imageKey?.trim() || undefined,
        addresses: [_toShopAddressInput(address)],
      })
      setAuthTokens(result.tokens)
      const myRole = await getMyRole(result.tokens.accessToken)
      setMyRole(myRole)
      setRegisteredShopName(result.shop.name)
      toast.success('Your shop has been registered.')
      await router.invalidate()
    } catch (error) {
      const message = _humaniseError(error)
      setSubmitError(message)
      toast.error(message)
    }
  }

  if (registeredShopName) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <span
            aria-hidden="true"
            className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Store aria-hidden="true" className="size-8" />
          </span>
          <CardTitle>Shop registered</CardTitle>
          <CardDescription>
            {registeredShopName} is pending review. You can manage it from the
            shop dashboard once approved.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell on Nexus</CardTitle>
        <CardDescription>
          Register a shop to list products and fulfil orders on the platform.
          Your shop starts in pending status until it is reviewed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TextField
          id="shop-name"
          name="shop-name"
          label="Shop name"
          placeholder="Nexus Electronics"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          id="shop-description"
          name="shop-description"
          label="Description"
          placeholder="What does your shop sell?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <ImageUploadDropzone
          accessToken={accessToken}
          imageKey={imageKey}
          onImageKeyChange={setImageKey}
          upload={(file, token, signal) =>
            uploadShopLogo(file, token ?? accessToken!, signal)
          }
          accept={SHOP_LOGO_ACCEPT}
          label="Shop logo"
          description="Optional. JPG or PNG, up to 2 MB. Shown on your shop profile and product pages."
          resetLabel="Remove logo"
          changeLabel="Change shop logo"
          disabled={!accessToken}
        />

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Business address
            </h3>
            <p className="text-sm text-muted-foreground">
              Primary warehouse or pickup location for your shop.
            </p>
          </div>
          <AddressForm
            formId="shop-register"
            initialValues={EMPTY_ADDRESS_FORM}
            submitLabel="Register shop"
            pendingLabel="Registering…"
            onSubmit={handleRegister}
            onCancel={() => {
              setName('')
              setDescription('')
              setImageKey(undefined)
              setSubmitError(null)
            }}
            errorMessage={submitError}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function _toShopAddressInput(values: AddressFormInput) {
  return {
    name: values.name.trim(),
    addressLine: values.addressLine.trim(),
    city: values.city.trim(),
    district: values.district.trim(),
    state: values.state.trim(),
    country: values.country.trim(),
    isPrimary: values.isPrimary,
  }
}

function _humaniseError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || 'Could not register your shop.'
  }
  return 'Could not register your shop.'
}
