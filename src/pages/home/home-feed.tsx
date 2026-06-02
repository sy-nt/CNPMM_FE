import { ProductGrid } from '#/components/product/product-grid'
import type { Category } from '#/lib/schemas/category.schema'
import type { ProductSummary } from '#/lib/schemas/product.schema'

type HomeFeedProps = {
  products: ReadonlyArray<ProductSummary>
  search: string | undefined
  activeCategory: Category | null
  error: string | undefined
}

export function HomeFeed({
  products,
  search,
  activeCategory,
  error,
}: HomeFeedProps) {
  const sectionLabel = activeCategory
    ? `Products in ${activeCategory.name}`
    : 'All products'

  const emptyLabel = search
    ? `No products matched “${search}”.`
    : activeCategory
      ? `No products in “${activeCategory.name}” yet.`
      : 'No products yet — check back soon.'

  return (
    <div className="space-y-4">
      {!search ? (
        <h2 className="text-lg font-semibold text-foreground">
          {sectionLabel}
        </h2>
      ) : null}
      <ProductGrid
        products={products}
        emptyLabel={emptyLabel}
        showEmpty={!error}
      />
    </div>
  )
}
