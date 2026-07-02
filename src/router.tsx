import type { QueryClient } from '@tanstack/react-query'
import { QueryClient as QueryClientImpl } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { routeTree } from './routeTree.gen'
import { LoadingFallback } from '#/components/loading-fallback'
import { NotFoundPage } from '#/pages/errors/not-found-page'
import { QUERY_GC_TIME_MS, QUERY_STALE_TIME_MS } from '#/lib/query/constants'

export type RouterContext = {
  queryClient: QueryClient
}

export function getRouter() {
  const queryClient = new QueryClientImpl({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => <LoadingFallback variant="page" />,
    defaultNotFoundComponent: NotFoundPage,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
