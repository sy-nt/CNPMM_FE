import { useEffect } from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'

import { CategoryShell } from '#/components/layout/category-shell'
import { HomeFeed } from '#/pages/home/home-feed'
import { HomeHeader } from '#/pages/home/home-header'
import { HomePagination } from '#/pages/home/home-pagination'
import { ProductSlider } from '#/pages/home/product-slider'

const _routeApi = getRouteApi('/')

export function HomePage() {
  const { products, slider, search, activeCategory, page, totalPage, error } =
    _routeApi.useLoaderData()
  const router = useRouter()
  const categorySlug = activeCategory?.slug

  useEffect(() => {
    if (page >= totalPage) return
    void router.preloadRoute({
      to: '/',
      search: { search, category: categorySlug, page: page + 1 },
    })
  }, [router, page, totalPage, search, categorySlug])

  const showSlider = !search && !activeCategory && slider.length > 0

  return (
    <CategoryShell activeCategorySlug={categorySlug}>
      <section className="rise-in space-y-8">
        <HomeHeader
          search={search}
          activeCategory={activeCategory}
          productCount={products.length}
        />

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        {showSlider ? <ProductSlider items={slider} /> : null}

        <HomeFeed
          products={products}
          search={search}
          activeCategory={activeCategory}
          error={error}
        />

        <HomePagination
          page={page}
          totalPage={totalPage}
          search={search}
          categorySlug={categorySlug}
        />
      </section>
    </CategoryShell>
  )
}
