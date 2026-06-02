import type { BreadcrumbItem } from '#/components/breadcrumb'
import type { Category } from '#/lib/schemas/category.schema'
import type { ProductDetail } from '#/lib/schemas/product.schema'

export function buildProductBreadcrumbs(
  product: ProductDetail,
  category: Category | null,
): ReadonlyArray<BreadcrumbItem> {
  const items: BreadcrumbItem[] = [{ label: 'Home', linkProps: { to: '/' } }]
  if (category) {
    items.push({
      label: category.name,
      linkProps: { to: '/', search: { category: category.slug } },
    })
  }
  items.push({ label: product.name })
  return items
}
