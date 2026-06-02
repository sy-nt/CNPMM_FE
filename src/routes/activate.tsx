import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { ActivateAccountPage } from '#/pages/auth/activate-account/activate-account-page'

const _searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/activate')({
  validateSearch: (search) => _searchSchema.parse(search),
  component: ActivateAccountPage,
})
