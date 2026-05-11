import { createFileRoute } from '@tanstack/react-router'

import { ActivateAccountPage } from './activate-account'

export const Route = createFileRoute('/activate')({
  component: ActivateAccountPage,
})
