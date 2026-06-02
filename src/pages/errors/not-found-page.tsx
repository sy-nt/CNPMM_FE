import { Link } from '@tanstack/react-router'

import { ErrorPageLayout } from '#/components/errors/error-page-layout'
import { Button } from '#/components/ui/button'

export function NotFoundPage() {
  return (
    <ErrorPageLayout
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      actions={
        <Button asChild>
          <Link to="/">Go to home</Link>
        </Button>
      }
    />
  )
}
