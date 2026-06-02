import type { Category } from '#/lib/schemas/category.schema'

type HomeHeaderProps = {
  search: string | undefined
  activeCategory: Category | null
  productCount: number
}

export function HomeHeader({
  search,
  activeCategory,
  productCount,
}: HomeHeaderProps) {
  const heading = search
    ? `Results for “${search}”`
    : activeCategory
      ? activeCategory.name
      : 'Welcome to Nexus'

  const subheading = search
    ? `${productCount} ${productCount === 1 ? 'product' : 'products'} on this page.`
    : activeCategory
      ? activeCategory.description ||
        `Browse products in ${activeCategory.name}.`
      : 'Browse categories on the left or search products from the header.'

  return (
    <header className="space-y-2">
      <h1 className="display-title text-3xl font-semibold text-foreground">
        {heading}
      </h1>
      <p className="text-muted-foreground">{subheading}</p>
    </header>
  )
}
