import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Boxes, Layers, Package2, Settings2 } from 'lucide-react'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { ProductImageUploadDropzone } from '#/components/image/product-image-upload-dropzone'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ScrollArea } from '#/components/ui/scroll-area'
import { ApiError } from '#/lib/api/client'
import { formatPrice } from '#/lib/format'
import {
  invalidateShopProductDetail,
  productMutations,
  shopProductDetailQueryOptions,
} from '#/lib/query/product'
import { PRODUCT_PERMISSIONS } from '#/lib/rbac/constants'
import type { ProductDetail, ProductSummary } from '#/lib/schemas/product.schema'
import { ProductAttributesPanel } from '#/pages/manage/shop/_product-attributes-panel'
import {
  PRODUCT_MANAGE_TAB_LABELS,
  PRODUCT_MANAGE_TABS,
  type ProductManageTab,
} from '#/pages/manage/shop/_product-manage.constants'
import { ProductSkusPanel } from '#/pages/manage/shop/_product-skus-panel'

type ProductManageDialogProps = {
  accessToken: string
  product: ProductSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const _TAB_ICONS: Record<ProductManageTab, ReactNode> = {
  [PRODUCT_MANAGE_TABS.OVERVIEW]: <Package2 className="size-4" />,
  [PRODUCT_MANAGE_TABS.ATTRIBUTES]: <Layers className="size-4" />,
  [PRODUCT_MANAGE_TABS.SKUS]: <Boxes className="size-4" />,
}

export function ProductManageDialog({
  accessToken,
  product,
  open,
  onOpenChange,
}: ProductManageDialogProps): ReactNode {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ProductManageTab>(
    PRODUCT_MANAGE_TABS.OVERVIEW,
  )
  const productId = product?.id ?? ''

  const detailQuery = useQuery({
    ...shopProductDetailQueryOptions(accessToken, productId),
    enabled: open && Boolean(productId),
  })

  const detail = detailQuery.data

  const refreshDetail = async (): Promise<void> => {
    if (!productId) return
    await invalidateShopProductDetail(queryClient, accessToken, productId)
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <div className="border-b bg-linear-to-br from-[var(--surface-strong)] to-[var(--surface)] px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80 shadow-xs">
                <Settings2 className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg">{product.name}</DialogTitle>
                  <Badge variant="outline">SPU</Badge>
                  {detail ? (
                    <Badge variant={detail.isActive ? 'secondary' : 'outline'}>
                      {detail.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  ) : null}
                </div>
                <DialogDescription>
                  Manage the product base (SPU), variant attributes, and sellable
                  SKUs in one place.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.values(PRODUCT_MANAGE_TABS).map((tab) => (
              <Button
                key={tab}
                type="button"
                size="sm"
                variant={activeTab === tab ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab)}
              >
                {_TAB_ICONS[tab]}
                {PRODUCT_MANAGE_TAB_LABELS[tab]}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="max-h-[min(72vh,720px)]">
          <div className="px-6 py-5">
            {detailQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading product…</p>
            ) : detailQuery.isError || !detail ? (
              <p className="text-sm text-destructive">
                Could not load product details.
              </p>
            ) : activeTab === PRODUCT_MANAGE_TABS.OVERVIEW ? (
              <ProductOverviewPanel
                key={detail.id}
                accessToken={accessToken}
                productId={productId}
                detail={detail}
                onChanged={refreshDetail}
              />
            ) : activeTab === PRODUCT_MANAGE_TABS.ATTRIBUTES ? (
              <ProductAttributesPanel
                accessToken={accessToken}
                queryClient={queryClient}
                productId={productId}
                attributes={detail.attributes}
                onChanged={refreshDetail}
              />
            ) : (
              <ProductSkusPanel
                accessToken={accessToken}
                queryClient={queryClient}
                productId={productId}
                attributes={detail.attributes}
                skus={detail.skus}
                onChanged={refreshDetail}
              />
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ProductOverviewPanelProps = {
  accessToken: string
  productId: string
  detail: ProductDetail
  onChanged: () => Promise<void>
}

function ProductOverviewPanel({
  accessToken,
  productId,
  detail,
  onChanged,
}: ProductOverviewPanelProps): ReactNode {
  const queryClient = useQueryClient()
  const mutations = productMutations(accessToken, queryClient)
  const [name, setName] = useState(detail.name)
  const [price, setPrice] = useState(detail.price)
  const [description, setDescription] = useState(detail.description ?? '')
  const [mainImageKey, setMainImageKey] = useState<string | undefined>(
    detail.mainImageKey ?? undefined,
  )

  const updateMutation = useMutation({
    ...mutations.update,
    onSuccess: async () => {
      await onChanged()
      toast.success('SPU updated.')
    },
    onError: (error) => {
      toast.error(_humanizeError(error, 'Could not update product.'))
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    updateMutation.mutate({
      productId,
      input: {
        name: name.trim(),
        price: price.trim(),
        description: description.trim() || undefined,
        mainImageKey,
      },
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-border/70 bg-card/70 p-4">
        <h3 className="mb-1 text-sm font-semibold">SPU details</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          The SPU is the shared product shell — name, base price, and
          description. Variants live in SKUs.
        </p>

        <RequirePermission all={[PRODUCT_PERMISSIONS.PRODUCT_UPDATE]}>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="spu-name">Name</Label>
              <Input
                id="spu-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spu-price">Base price</Label>
              <Input
                id="spu-price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spu-description">Description</Label>
              <Input
                id="spu-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <ProductImageUploadDropzone
              accessToken={accessToken}
              imageKey={mainImageKey}
              defaultImageKey={detail.mainImageKey}
              onImageKeyChange={setMainImageKey}
              label="Main product image"
            />
            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
              Save SPU
            </Button>
          </form>
        </RequirePermission>
      </section>

      <section className="space-y-3">
        <div className="rounded-xl border border-border/70 bg-card/70 p-4">
          <h3 className="mb-3 text-sm font-semibold">Catalog snapshot</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Slug
              </dt>
              <dd>{detail.slug}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Listed price
              </dt>
              <dd>{formatPrice(detail.price) ?? detail.price}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Category
              </dt>
              <dd>{detail.category?.name ?? detail.categoryId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Variant axes
              </dt>
              <dd>{detail.attributes.length} attributes</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Sellable SKUs
              </dt>
              <dd>{detail.skus.length}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">How SPU and SKU relate</p>
          <p className="mt-2">
            <strong>SPU</strong> = one catalog product. <strong>Attributes</strong>{' '}
            = options like Color or Size. <strong>SKU</strong> = one purchasable
            combination with its own code, price, and warehouse stock.
          </p>
        </div>
      </section>
    </div>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
