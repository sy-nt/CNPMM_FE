import type { ReactNode } from 'react'

import { Card, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { ManageSection } from '#/pages/manage/_manage-section'

export function ShopStaffRosterPage(): ReactNode {
  return (
    <ManageSection
      title="Shop staff roster"
      description="Roster listing depends on a backend endpoint that is not available yet."
    >
      <Card>
        <CardHeader>
          <CardTitle>Roster endpoint unavailable</CardTitle>
          <CardDescription>
            Current backend contracts do not expose a list endpoint for shop staff and moderators.
            This page will switch to a full roster view once that API is released.
          </CardDescription>
        </CardHeader>
      </Card>
    </ManageSection>
  )
}
