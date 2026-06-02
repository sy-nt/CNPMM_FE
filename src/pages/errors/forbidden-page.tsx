import { Link } from '@tanstack/react-router'

import { ErrorPageLayout } from '#/components/errors/error-page-layout'
import { Button } from '#/components/ui/button'
import { useClientStore } from '#/hooks/use-client-store'
import {
  authStore,
  clearAuthTokens,
  selectIsAuthenticated,
} from '#/stores/auth.store'

export function ForbiddenPage() {
  const isAuthenticated = useClientStore(
    authStore,
    selectIsAuthenticated,
    false,
  )

  return (
    <ErrorPageLayout
      code="403"
      title="Access denied"
      description={
        isAuthenticated
          ? 'You are signed in, but your account does not have permission to view this page. If you think this is a mistake, contact your administrator.'
          : 'You need to be signed in to view this page.'
      }
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/">Go to home</Link>
          </Button>
          {isAuthenticated ? (
            <Button asChild variant="default" onClick={clearAuthTokens}>
              <Link to="/sign-in">Switch account</Link>
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link to="/sign-in">Sign in</Link>
            </Button>
          )}
        </>
      }
    />
  )
}
