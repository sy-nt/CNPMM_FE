import { createFileRoute } from '@tanstack/react-router'

import { HelpPage } from '#/pages/help/help-page'

export const Route = createFileRoute('/help')({
  component: HelpPage,
})
