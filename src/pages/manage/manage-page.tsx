import { CategoryShell } from '#/components/layout/category-shell'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function ManagePage() {
  return (
    <CategoryShell>
      <Card>
        <CardHeader>
          <CardTitle>Manager</CardTitle>
          <CardDescription>
            Management tools for your role will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    </CategoryShell>
  )
}
