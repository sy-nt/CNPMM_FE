import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'

import { ImageUploadDropzone } from '#/components/image/image-upload-dropzone'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ApiError } from '#/lib/api/client'
import { SHOP_LOGO_ACCEPT } from '#/lib/api/image.constants'
import { getShopDetails, updateShop } from '#/lib/api/shop'
import { shopKeys } from '#/lib/query/keys'
import { SHOP_IMAGE_PERMISSIONS, SHOP_PERMISSIONS } from '#/lib/rbac/constants'
import { uploadShopLogo } from '#/lib/upload/shop-logo'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const SHOP_DETAILS_ID = 'me'

const _shopShapeSchema = z
  .object({
    imageKey: z.string().nullable().optional(),
  })
  .passthrough()

const _shopEnvelopeSchema = z.object({ shop: _shopShapeSchema }).passthrough()

function _extractImageKey(raw: unknown): string {
  const envelopeResult = _shopEnvelopeSchema.safeParse(raw)
  if (envelopeResult.success) {
    return envelopeResult.data.shop.imageKey?.trim() ?? ''
  }
  const directResult = _shopShapeSchema.safeParse(raw)
  if (directResult.success) {
    return directResult.data.imageKey?.trim() ?? ''
  }
  return ''
}

export function ShopImagesPage() {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [imageKey, setImageKey] = useState('')

  const detailsQuery = useQuery({
    queryKey: shopKeys.detail(accessToken, SHOP_DETAILS_ID),
    queryFn: ({ signal }) => getShopDetails(accessToken, SHOP_DETAILS_ID, signal),
  })

  useEffect(() => {
    if (!detailsQuery.data) return
    setImageKey(_extractImageKey(detailsQuery.data))
  }, [detailsQuery.data])

  const saveMutation = useMutation({
    mutationFn: (key: string) =>
      updateShop(accessToken, { imageKey: key.trim() || undefined }),
    onSuccess: async () => {
      toast.success('Shop logo saved.')
      await queryClient.invalidateQueries({ queryKey: shopKeys.all })
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not save shop logo.'
      toast.error(message)
    },
  })

  return (
    <ManageSection
      title="Shop images"
      description="Upload and apply your shop logo image."
    >
      <ManageAsyncState
        isLoading={detailsQuery.isLoading}
        isError={detailsQuery.isError}
        isEmpty={false}
        emptyTitle="No shop details"
        emptyDescription="Could not load shop details for image management."
      >
        <Card>
          <CardHeader>
            <CardTitle>Shop logo</CardTitle>
            <CardDescription>
              Upload a JPG or PNG logo and persist it to your shop profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RequirePermission
              all={[SHOP_IMAGE_PERMISSIONS.SHOP_IMAGE_CREATE_PRESIGNED_URL]}
            >
              <ImageUploadDropzone
                accessToken={accessToken}
                imageKey={imageKey}
                defaultImageKey={_extractImageKey(detailsQuery.data)}
                onImageKeyChange={(nextKey) => setImageKey(nextKey ?? '')}
                upload={(file, maybeToken, signal) => {
                  if (!maybeToken) {
                    return Promise.reject(
                      new Error('Authentication is required for image upload.'),
                    )
                  }
                  return uploadShopLogo(file, maybeToken, signal)
                }}
                accept={SHOP_LOGO_ACCEPT}
                label="Shop logo"
              />
            </RequirePermission>
            <RequirePermission all={[SHOP_PERMISSIONS.SHOP_UPDATE]}>
              <Button
                type="button"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate(imageKey)}
              >
                Save logo
              </Button>
            </RequirePermission>
          </CardContent>
        </Card>
      </ManageAsyncState>
    </ManageSection>
  )
}
