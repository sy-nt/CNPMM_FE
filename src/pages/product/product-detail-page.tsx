import { useEffect, useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { Loader2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

import { Breadcrumb } from '#/components/breadcrumb'
import { CategoryShell } from '#/components/layout/category-shell'
import { RichText } from '#/components/rich-text'
import { Button } from '#/components/ui/button'
import { ApiError } from '#/lib/api/client'
import { cartMutations } from '#/lib/query/cart'
import { formatPrice } from '#/lib/format'
import { buildProductBreadcrumbs } from '#/pages/product/_breadcrumbs'
import {
  initialSelection,
  matchSkuFromSelection,
  selectionFromSku,
} from '#/pages/product/_sku-selection'
import type { AttributeSelection } from '#/pages/product/_sku-selection'
import { ProductAttributes } from '#/pages/product/product-attributes'
import { ProductGallery } from '#/pages/product/product-gallery'
import type { GallerySelection } from '#/pages/product/product-gallery'
import { ProductQuantitySection } from '#/pages/product/product-quantity-section'
import { ProductShopSection } from '#/pages/product/product-shop-section'
import { ProductSummary } from '#/pages/product/product-summary'
import { QUANTITY_MIN } from '#/pages/product/quantity-stepper'
import { SimilarProducts } from '#/pages/product/similar-products'
import { resolveStockInfo } from '#/pages/product/stock-indicator'
import {
  authStore,
  selectAccessToken,
  selectIsAuthenticated,
} from '#/stores/auth.store'

const _routeApi = getRouteApi('/product/$slug')

/**
 * Hard ceiling for products that don't expose per-SKU stock (e.g. simple
 * products with no SKUs). Real stock from `sku.quantity` always wins when
 * present.
 */
const QUANTITY_FALLBACK_MAX = 99

export function ProductDetailPage() {
  const { product, similar } = _routeApi.useLoaderData()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accessToken = useStore(authStore, selectAccessToken)
  const isAuthenticated = useStore(authStore, selectIsAuthenticated)
  const category = product.category ?? null
  const [selection, setSelection] = useState<AttributeSelection>(() =>
    initialSelection(product),
  )
  /**
   * `null` ⇒ derive the active image from the matched SKU (or main).
   * Set to a specific image key when the user clicks a gallery thumbnail
   * that doesn't correspond to a SKU (e.g. the main image), so we don't
   * silently snap back to the SKU's image on the next render.
   */
  const [overrideImageKey, setOverrideImageKey] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(QUANTITY_MIN)

  const addToCart = useMutation(
    cartMutations(accessToken ?? '', queryClient).addItem,
  )

  const matchedSku = useMemo(
    () => matchSkuFromSelection(product.skus, selection),
    [product.skus, selection],
  )
  const skuRequired = product.skus.length > 0

  const activeImageKey =
    overrideImageKey ?? matchedSku?.imageKey ?? product.mainImageKey ?? null

  const formattedPrice = formatPrice(matchedSku?.price ?? product.price)
  const breadcrumbItems = buildProductBreadcrumbs(product, category)

  const stockInfo = resolveStockInfo({ matchedSku, skuRequired })
  const maxQuantity = stockInfo.available ?? QUANTITY_FALLBACK_MAX
  const isOutOfStock = stockInfo.available === 0
  const isInactive = !product.isActive || matchedSku?.isActive === false
  const canAddToCart =
    !isInactive &&
    !isOutOfStock &&
    quantity >= QUANTITY_MIN &&
    quantity <= maxQuantity &&
    (skuRequired ? Boolean(matchedSku) : true)

  // Re-clamp the user's quantity whenever the matched SKU's stock shrinks
  // below it (variant change, server-side restock that returned less, …). We
  // never silently raise it — that would be a surprise on a slow click.
  useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(Math.max(QUANTITY_MIN, maxQuantity))
    }
  }, [maxQuantity, quantity])

  const handleSelectAttribute = (
    attributeId: string,
    valueId: string,
  ): void => {
    setSelection((current) => ({ ...current, [attributeId]: valueId }))
    setOverrideImageKey(null)
  }

  const handleSelectGalleryEntry = (entry: GallerySelection): void => {
    if (entry.sku) {
      setSelection(selectionFromSku(entry.sku))
      setOverrideImageKey(null)
      return
    }
    setOverrideImageKey(entry.imageKey)
  }

  const handleQuantityChange = (next: number): void => {
    const clamped = Math.min(Math.max(QUANTITY_MIN, next), maxQuantity)
    setQuantity(clamped)
  }

  const handleAddToCart = async (): Promise<void> => {
    if (addToCart.isPending) return
    if (skuRequired && !matchedSku) {
      toast.error('Please choose every option before adding to cart.')
      return
    }
    if (isOutOfStock) {
      toast.error('This variant is out of stock.')
      return
    }
    if (quantity > maxQuantity) {
      toast.error(`Only ${maxQuantity} available — quantity reduced.`)
      setQuantity(maxQuantity)
      return
    }
    if (!isAuthenticated || !accessToken) {
      toast.error('Sign in to add items to your cart.')
      void navigate({ to: '/sign-in' })
      return
    }
    if (!matchedSku) {
      toast.error('This product has no purchasable variant yet.')
      return
    }

    try {
      await addToCart.mutateAsync({
        skuId: matchedSku.id,
        quantity,
        idempotencyKey: _newIdempotencyKey(),
      })
      toast.success(`Added ${quantity} × ${product.name} to your cart.`)
    } catch (error) {
      const fallback = 'Could not add this item to your cart.'
      const message =
        error instanceof ApiError ? error.message || fallback : fallback
      toast.error(message)
    }
  }

  return (
    <CategoryShell activeCategorySlug={category?.slug}>
      <article className="rise-in space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ProductGallery
            product={product}
            activeImageKey={activeImageKey}
            onSelect={handleSelectGalleryEntry}
          />

          <div className="space-y-6">
            <ProductSummary
              name={product.name}
              formattedPrice={formattedPrice}
              isActive={product.isActive}
            />

            {product.description ? (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <RichText html={product.description} />
              </section>
            ) : null}

            <ProductAttributes
              attributes={product.attributes}
              skus={product.skus}
              selection={selection}
              matchedSku={matchedSku}
              onSelect={handleSelectAttribute}
            />

            <ProductQuantitySection
              quantity={quantity}
              maxQuantity={maxQuantity}
              stockInfo={stockInfo}
              disabled={isOutOfStock || isInactive}
              onChange={handleQuantityChange}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={() => void handleAddToCart()}
                disabled={!canAddToCart || addToCart.isPending}
              >
                {addToCart.isPending ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart aria-hidden="true" />
                )}
                {addToCart.isPending ? 'Adding…' : 'Add to cart'}
              </Button>
            </div>
          </div>
        </div>

        {product.shop ? <ProductShopSection shop={product.shop} /> : null}

        <SimilarProducts
          products={similar}
          categoryName={category?.name ?? null}
        />
      </article>
    </CategoryShell>
  )
}

/**
 * `POST /cart/items` accepts `Idempotency-Key` matching `[A-Za-z0-9_-]{8,128}`.
 * `crypto.randomUUID()` returns a 36-char hyphenated UUID which fits the
 * regex and is unique per click, so retried adds dedupe server-side.
 */
function _newIdempotencyKey(): string {
  return crypto.randomUUID()
}
