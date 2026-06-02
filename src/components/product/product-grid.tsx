import { ProductCard } from '#/components/product/product-card'
import type { ProductSummary } from '#/lib/schemas/product.schema'

type ProductGridProps = {
  products: ReadonlyArray<ProductSummary>
  emptyLabel?: string
  showEmpty?: boolean
}

export function ProductGrid({
  products,
  emptyLabel = 'No products yet — check back soon.',
  showEmpty = true,
}: ProductGridProps) {
  if (products.length === 0) {
    if (!showEmpty) return null
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
