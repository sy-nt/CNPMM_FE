import { ProductGrid } from '#/components/product/product-grid'
import type { ProductSummary } from '#/lib/schemas/product.schema'

type SimilarProductsProps = {
  products: ReadonlyArray<ProductSummary>
  categoryName: string | null
}

export function SimilarProducts({
  products,
  categoryName,
}: SimilarProductsProps) {
  if (products.length === 0) return null

  const heading = categoryName
    ? `More from ${categoryName}`
    : 'Similar products'

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      <ProductGrid products={products} showEmpty={false} />
    </section>
  )
}
