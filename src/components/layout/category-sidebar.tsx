import { useCallback, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ChevronLeft, LayoutGrid } from 'lucide-react'

import { ImageWithFallback } from '#/components/image-with-fallback'
import { LoadingFallback } from '#/components/loading-fallback'
import { useFetch } from '#/hooks/use-fetch'
import {
  getCachedCategories,
  getCachedCategory,
  getCategoryTree,
  listCategories,
} from '#/lib/api/category'
import {
  CATEGORY_LIST_DEFAULT_QUERY,
  CATEGORY_TREE_DEFAULT_QUERY,
} from '#/lib/api/category.constants'
import type { Category } from '#/lib/schemas/category.schema'
import { findBySlug } from '#/lib/slug'
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
 * Hierarchy-aware category navigator. The list is always the children of the
 * currently selected category (or top-level when none is selected), so the
 * sidebar acts as a Miller-column drill-down: every click navigates to a new
 * slug, the next render fetches that slug's children (cached), and the cycle
 * repeats until a leaf is reached.
 */
export function CategorySidebar({
  className,
  activeCategorySlug,
}: CategorySidebarProps) {
  const accessToken = useStore(authStore, selectAccessToken)

  // Full pool — drives slug resolution + top-level view. Cached request, so
  // every page reuses the same response without a network hit.
  const poolFetcher = useCallback(
    (signal: AbortSignal): Promise<ReadonlyArray<Category>> =>
      listCategories(accessToken, CATEGORY_LIST_DEFAULT_QUERY, signal),
    [accessToken],
  )
  const {
    data: pool,
    isLoading: isLoadingPool,
    isError: isErrorPool,
    error: errorPool,
  } = useFetch<ReadonlyArray<Category>>(poolFetcher, { deps: [accessToken] })

  // Resolve the slug against the fresh page-one snapshot first, then fall
  // back to the shared category index (populated by every `listCategories` /
  // `getCategoryTree` call). The fallback is what lets a drill into a child
  // that never made page one still find its `activeCategory` — without it
  // `activeCategory` would be null, the children fetch would stay disabled,
  // and the sidebar would silently keep showing the top-level roster.
  const activeCategory = useMemo<Nullable<Category>>(() => {
    if (!activeCategorySlug) return null
    const bySlug = (c: Category): string => c.slug
    return (
      (pool ? findBySlug(pool, bySlug, activeCategorySlug) : undefined) ??
      findBySlug(getCachedCategories(), bySlug, activeCategorySlug) ??
      null
    )
  }, [activeCategorySlug, pool])

  const parentCategory = useMemo<Nullable<Category>>(() => {
    if (!activeCategory?.parentId) return null
    return (
      pool?.find((c) => c.id === activeCategory.parentId) ??
      getCachedCategory(activeCategory.parentId) ??
      null
    )
  }, [activeCategory, pool])

  // Drill-down — direct children of the active category. Cache-deduped with
  // the route loader, so this is normally a hit. Gated by `enabled` so we
  // never fire when there's nothing to drill into.
  const childrenFetcher = useCallback(
    async (signal: AbortSignal): Promise<ReadonlyArray<Category>> => {
      if (!activeCategory) return []
      return getCategoryTree(
        accessToken,
        activeCategory.id,
        CATEGORY_TREE_DEFAULT_QUERY,
        signal,
      )
    },
    [accessToken, activeCategory],
  )
  const {
    data: children,
    isLoading: isLoadingChildren,
    isError: isErrorChildren,
    error: errorChildren,
  } = useFetch<ReadonlyArray<Category>>(childrenFetcher, {
    enabled: Boolean(activeCategory),
    deps: [accessToken, activeCategory?.id],
  })

  const items = useMemo<ReadonlyArray<Category>>(() => {
    const raw = activeCategory
      ? (children ?? [])
      : _filterTopLevel(pool ?? [])
    return _sortByDisplayOrder(raw)
  }, [activeCategory, children, pool])

  const isLoading =
    isLoadingPool || (Boolean(activeCategory) && isLoadingChildren)
  const isError = isErrorPool || isErrorChildren
  const error = errorPool ?? errorChildren

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

function _filterTopLevel(
  categories: ReadonlyArray<Category>,
): ReadonlyArray<Category> {
  return categories.filter((c) => !c.parentId)
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
