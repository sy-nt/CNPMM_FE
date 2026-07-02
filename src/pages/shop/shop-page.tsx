import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Breadcrumb } from '#/components/breadcrumb'
import { AppShell } from '#/components/layout/app-shell'
import { ProductGrid } from '#/components/product/product-grid'
import { PaginationNav } from '#/components/pagination/pagination-nav'
import { ShopHeader } from '#/pages/shop/shop-header'

const _routeApi = getRouteApi('/shop/$slug')

export function ShopPage() {
  const { shop, products, page, totalPage, error } = _routeApi.useLoaderData()
  const router = useRouter()

  useEffect(() => {
    if (page >= totalPage) return
    void router.preloadRoute({
      to: '/shop/$slug',
      params: { slug: shop.slug },
      search: { page: page + 1 },
    })
  }, [router, page, totalPage, shop.slug])

  return (
    <AppShell>
      <article className="rise-in space-y-8">
        <Breadcrumb
          items={[
            { label: 'Home', linkProps: { to: '/' } },
            { label: shop.name },
          ]}
        />

        <ShopHeader shop={shop} />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Products</h2>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <ProductGrid
            products={products}
            emptyLabel={`${shop.name} has no products listed yet.`}
            showEmpty={!error}
          />

          <PaginationNav
            page={page}
            totalPage={totalPage}
            renderLink={({ page: targetPage, content, ariaLabel }) => (
              <Link
                to="/shop/$slug"
                params={{ slug: shop.slug }}
                search={{ page: targetPage }}
                aria-label={ariaLabel}
              >
                {content}
              </Link>
            )}
          />
        </section>
      </article>
    </AppShell>
  )
}
