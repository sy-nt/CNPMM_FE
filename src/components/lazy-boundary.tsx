import { Suspense } from 'react'
import type { ReactNode } from 'react'

import { LoadingFallback } from '#/components/loading-fallback'

type LazyBoundaryProps = {
  children: ReactNode
  /** Override the default themed fallback. */
  fallback?: ReactNode
  /** Forwarded to the default `<LoadingFallback />` when no `fallback` is provided. */
  variant?: 'inline' | 'page'
  /** Forwarded to the default `<LoadingFallback />` when no `fallback` is provided. */
  label?: string
}

/**
 * Standard `<Suspense>` boundary with the project's themed loading UI.
 *
 * Use to wrap heavy NON-ROUTE components that are code-split with `React.lazy()`.
 * Routes are already split automatically by TanStack Start's bundler, and the
 * router renders `defaultPendingComponent` during route transitions — you do
 * NOT need this for routes.
 *
 * @example
 * import { lazy } from 'react'
 * import { LazyBoundary } from '#/components/lazy-boundary'
 *
 * const RichEditor = lazy(() => import('./rich-editor'))
 *
 * export function PostForm() {
 *   return (
 *     <LazyBoundary>
 *       <RichEditor />
 *     </LazyBoundary>
 *   )
 * }
 */
export function LazyBoundary({
  children,
  fallback,
  variant = 'inline',
  label,
}: LazyBoundaryProps) {
  const resolvedFallback = fallback ?? (
    <LoadingFallback variant={variant} label={label} />
  )
  return <Suspense fallback={resolvedFallback}>{children}</Suspense>
}
