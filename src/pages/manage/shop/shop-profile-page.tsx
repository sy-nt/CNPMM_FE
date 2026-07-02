import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'

import { ShopLogoUploadDropzone } from '#/components/image/shop-logo-upload-dropzone'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { getShopDetails, updateShop } from '#/lib/api/shop'
import { shopKeys } from '#/lib/query/keys'
import { SHOP_PERMISSIONS } from '#/lib/rbac/constants'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const SHOP_DETAILS_ID = 'me'

const _shopShapeSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().optional(),
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    imageKey: z.string().nullable().optional(),
  })
  .passthrough()

const _shopEnvelopeSchema = z.object({ shop: _shopShapeSchema }).passthrough()

type ShopFormState = {
  name: string
  description: string
  imageKey: string
}

const _EMPTY_FORM: ShopFormState = {
  name: '',
  description: '',
  imageKey: '',
}

function _toFormState(raw: unknown): ShopFormState {
  const envelopeResult = _shopEnvelopeSchema.safeParse(raw)
  if (envelopeResult.success) {
    const { shop } = envelopeResult.data
    return {
      name: shop.name?.trim() ?? '',
      description: shop.description?.trim() ?? '',
      imageKey: shop.imageKey?.trim() ?? '',
    }
  }

  const directResult = _shopShapeSchema.safeParse(raw)
  if (directResult.success) {
    return {
      name: directResult.data.name?.trim() ?? '',
      description: directResult.data.description?.trim() ?? '',
      imageKey: directResult.data.imageKey?.trim() ?? '',
    }
  }

  return _EMPTY_FORM
}

export function ShopProfilePage() {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ShopFormState>(_EMPTY_FORM)

  const detailsQuery = useQuery({
    queryKey: shopKeys.detail(accessToken, SHOP_DETAILS_ID),
    queryFn: ({ signal }) => getShopDetails(accessToken, SHOP_DETAILS_ID, signal),
  })

  const parsedDetails = useMemo(
    () => _toFormState(detailsQuery.data),
    [detailsQuery.data],
  )

  const updateMutation = useMutation({
    mutationFn: (input: ShopFormState) =>
      updateShop(accessToken, {
        name: input.name.trim() || undefined,
        description: input.description.trim() || undefined,
        imageKey: input.imageKey.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success('Shop profile updated.')
      await queryClient.invalidateQueries({ queryKey: shopKeys.all })
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not update shop profile.'
      toast.error(message)
    },
  })

  const effectiveForm =
    form === _EMPTY_FORM && detailsQuery.data !== undefined ? parsedDetails : form

  return (
    <ManageSection
      title="Shop profile"
      description="Update your shop identity, description, and logo."
    >
      <ManageAsyncState
        isLoading={detailsQuery.isLoading}
        isError={detailsQuery.isError}
        isEmpty={false}
        emptyTitle="No shop profile"
        emptyDescription="We could not locate your shop profile."
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Keep storefront details up to date for catalog and order pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ShopLogoUploadDropzone
              accessToken={accessToken}
              imageKey={effectiveForm.imageKey || null}
              defaultImageKey={parsedDetails.imageKey || null}
              onImageKeyChange={(imageKey) =>
                setForm((prev) => {
                  const base =
                    prev === _EMPTY_FORM && detailsQuery.data !== undefined
                      ? parsedDetails
                      : prev
                  return { ...base, imageKey: imageKey ?? '' }
                })
              }
            />

            <div className="space-y-2">
              <Label htmlFor="shop-name">Shop name</Label>
              <Input
                id="shop-name"
                value={effectiveForm.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...(prev === _EMPTY_FORM ? parsedDetails : prev),
                    name: event.target.value,
                  }))
                }
                placeholder="Enter shop name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop-description">Description</Label>
              <Input
                id="shop-description"
                value={effectiveForm.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...(prev === _EMPTY_FORM ? parsedDetails : prev),
                    description: event.target.value,
                  }))
                }
                placeholder="Describe your shop"
              />
            </div>

            <RequirePermission all={[SHOP_PERMISSIONS.SHOP_UPDATE]}>
              <Button
                type="button"
                onClick={() => updateMutation.mutate(effectiveForm)}
                disabled={updateMutation.isPending}
              >
                Save profile
              </Button>
            </RequirePermission>
          </CardContent>
        </Card>
      </ManageAsyncState>
    </ManageSection>
  )
}
