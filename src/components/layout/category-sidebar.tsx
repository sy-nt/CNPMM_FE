import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { ChevronLeft, LayoutGrid } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { LoadingFallback } from '#/components/loading-fallback'
import { getCachedCategory } from '#/lib/api/category'
import {
  CATEGORY_LIST_DEFAULT_QUERY,
  CATEGORY_SIDEBAR_CHILDREN_DEPTH,
} from '#/lib/api/category.constants'
import {
  categoryBySlugQueryOptions,
  categoryListQueryOptions,
  categoryTreeQueryOptions,
} from '#/lib/query/category'
import type { Category } from '#/lib/schemas/category.schema'
import type { Nullable } from '#/lib/types'
import { cn } from '#/lib/utils'
import { authStore, selectAccessToken } from '#/stores/auth.store'

type CategorySidebarProps = {
  className?: string
  /**
   * Slug of the currently active category. When set, the sidebar replaces its
   * roster with that category's direct children and prepends a back row.
   * When omitted, the sidebar lists top-level categories.
   */
  activeCategorySlug?: string
}

/**
 * Hierarchy-aware category navigator. Root categories come from `GET
 * /categories/`; drilling in loads direct children via `GET /category/:id`.
 */
export function CategorySidebar({
  className,
  activeCategorySlug,
}: CategorySidebarProps) {
  const accessToken = useStore(authStore, selectAccessToken)

  const {
    data: rootCategories,
    isLoading: isLoadingRoots,
    isError: isErrorRoots,
    error: errorRoots,
  } = useQuery(categoryListQueryOptions(accessToken, CATEGORY_LIST_DEFAULT_QUERY))

  const {
    data: activeCategory,
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: errorActive,
  } = useQuery({
    ...categoryBySlugQueryOptions(accessToken, activeCategorySlug ?? ''),
    enabled: Boolean(activeCategorySlug),
  })

  const parentCategory = useMemo<Nullable<Category>>(() => {
    if (!activeCategory?.parentId) return null
    return getCachedCategory(activeCategory.parentId) ?? null
  }, [activeCategory])

  const {
    data: children,
    isLoading: isLoadingChildren,
    isError: isErrorChildren,
    error: errorChildren,
  } = useQuery({
    ...categoryTreeQueryOptions(
      accessToken,
      activeCategory?.id ?? '',
      { depth: CATEGORY_SIDEBAR_CHILDREN_DEPTH },
    ),
    enabled: Boolean(activeCategory?.id),
  })

  const items = useMemo<ReadonlyArray<Category>>(() => {
    const raw = activeCategory ? (children ?? []) : (rootCategories ?? [])
    return _sortByDisplayOrder(raw)
  }, [activeCategory, children, rootCategories])

  const isLoading =
    isLoadingRoots ||
    (Boolean(activeCategorySlug) && isLoadingActive) ||
    (Boolean(activeCategory) && isLoadingChildren)
  const isError = isErrorRoots || isErrorActive || isErrorChildren
  const error = errorRoots ?? errorActive ?? errorChildren

  const headingLabel = activeCategory?.name ?? 'Categories'
  const emptyLabel = activeCategory ? 'No subcategories.' : 'No categories yet.'

  return (
    <aside
      aria-label="Categories"
      className={cn(
        'flex h-fit w-full flex-col gap-3 rounded-xl border border-border bg-card/70 p-4 backdrop-blur',
        className,
      )}
    >
      {activeCategory ? <SidebarBackRow parent={parentCategory} /> : null}

      <header className="flex items-center gap-2">
        <LayoutGrid
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
        <h2 className="truncate text-sm font-semibold tracking-wide text-foreground uppercase">
          {headingLabel}
        </h2>
      </header>

      {isLoading ? (
        <LoadingFallback variant="inline" label="Loading categories…" />
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">
          {error?.message ?? 'Failed to load categories.'}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((category) => {
            const slug = category.slug
            return (
              <li key={category.id}>
                <Link
                  to="/"
                  search={{ category: slug }}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-2 py-2 text-sm text-foreground no-underline transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    activeCategorySlug === slug &&
                      'bg-accent text-accent-foreground',
                  )}
                >
                  <ImageWithFallback
                    src={category.iconUrl}
                    alt=""
                    className="size-8 rounded-md"
                  />
                  <span className="truncate">{category.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

type SidebarBackRowProps = {
  parent: Nullable<Category>
}

function SidebarBackRow({ parent }: SidebarBackRowProps) {
  const className =
    'flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-xs text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground'

  if (parent) {
    return (
      <Link to="/" search={{ category: parent.slug }} className={className}>
        <ChevronLeft aria-hidden="true" className="size-3.5" />
        <span className="truncate">{parent.name}</span>
      </Link>
    )
  }

  return (
    <Link to="/" className={className}>
      <ChevronLeft aria-hidden="true" className="size-3.5" />
      <span>All categories</span>
    </Link>
  )
}

function _sortByDisplayOrder(
  categories: ReadonlyArray<Category>,
): ReadonlyArray<Category> {
  return [...categories].sort((a, b) => {
    const ao = a.displayOrder ?? Number.POSITIVE_INFINITY
    const bo = b.displayOrder ?? Number.POSITIVE_INFINITY
    if (ao !== bo) return ao - bo
    return a.name.localeCompare(b.name)
  })
}
