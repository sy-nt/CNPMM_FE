import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ManageSection } from '#/pages/manage/_manage-section'

export function ShopModeratorsPage() {
  return (
    <ManageSection
      title="Moderators"
      description="Moderator assignment routes are not available from backend APIs yet."
    >
      <Card>
        <CardHeader>
          <CardTitle>Read-only status</CardTitle>
          <CardDescription>
            The current backend does not expose assign or unassign endpoints for
            shop moderators. Once APIs are available, moderator CRUD can be enabled
            here.
          </CardDescription>
        </CardHeader>
      </Card>
    </ManageSection>
  )
}
