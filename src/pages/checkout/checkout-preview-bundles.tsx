import { ImageWithFallback } from '#/components/image-with-fallback'
import { formatPrice } from '#/lib/format'
import { resolveImageUrl } from '#/lib/images'
import type { CheckoutPreviewBundle } from '#/lib/schemas/order.schema'

type CheckoutPreviewBundlesProps = {
  bundles: ReadonlyArray<CheckoutPreviewBundle>
}

export function CheckoutPreviewBundles({ bundles }: CheckoutPreviewBundlesProps) {
  if (bundles.length === 0) return null

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Order items</h2>
        <p className="text-sm text-muted-foreground">
          {bundles.length === 1
            ? 'Items from one shop.'
            : `Items split across ${bundles.length} shops.`}
        </p>
      </div>

      <div className="space-y-4">
        {bundles.map((previewBundle) => (
          <CheckoutShopBundle
            key={previewBundle.bundle.shopId}
            previewBundle={previewBundle}
          />
        ))}
      </div>
    </section>
  )
}

type CheckoutShopBundleProps = {
  previewBundle: CheckoutPreviewBundle
}

function CheckoutShopBundle({ previewBundle }: CheckoutShopBundleProps) {
  const { bundle, delivery, discounts } = previewBundle
  const itemsDiscount = discounts.itemsDiscount
  const deliveryDiscount = discounts.deliveryDiscount

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Shop order
        </h3>
        <p className="text-xs text-muted-foreground">
          Shipping fee {formatPrice(delivery.fee) ?? '—'}
        </p>
      </div>

      <ul className="divide-y divide-border">
        {bundle.items.map((item) => (
          <li
            key={item.skuId}
            className="flex items-center gap-4 px-4 py-3"
          >
            <ImageWithFallback
              src={resolveImageUrl(item.imageKey)}
              alt=""
              className="size-16 shrink-0 rounded-md border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Qty {item.quantity} · {formatPrice(item.unitPrice) ?? '—'} each
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {formatPrice(
                String(Number(item.unitPrice) * item.quantity),
              ) ?? '—'}
            </p>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t border-border px-4 py-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Items subtotal</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatPrice(bundle.itemsSubtotal) ?? '—'}
          </span>
        </div>
        {itemsDiscount ? (
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Items discount</span>
            <span className="font-medium tabular-nums text-primary">
              −{formatPrice(itemsDiscount.amount) ?? '—'}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatPrice(delivery.fee) ?? '—'}
          </span>
        </div>
        {deliveryDiscount ? (
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Shipping discount</span>
            <span className="font-medium tabular-nums text-primary">
              −{formatPrice(deliveryDiscount.amount) ?? '—'}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 border-t border-border pt-2">
          <span className="font-medium text-foreground">Shop total</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatPrice(previewBundle.totalAmount) ?? '—'}
          </span>
        </div>
      </div>
    </article>
  )
}
