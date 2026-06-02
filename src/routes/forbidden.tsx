import { createFileRoute } from '@tanstack/react-router'

import { ForbiddenPage } from '#/pages/errors/forbidden-page'

export const Route = createFileRoute('/forbidden')({
  component: ForbiddenPage,
})
