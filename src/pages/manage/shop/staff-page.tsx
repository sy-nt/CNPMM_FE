import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { assignShopWorker } from '#/lib/api/shop'
import { SHOP_STAFF_PERMISSIONS } from '#/lib/rbac/constants'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

export function ShopStaffPage() {
  const accessToken = useManageAccessToken()
  const [email, setEmail] = useState('')

  const assignMutation = useMutation({
    mutationFn: (input: { email: string }) => assignShopWorker(accessToken, input),
    onSuccess: () => {
      toast.success('Staff member assigned.')
      setEmail('')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Could not assign shop staff.'
      toast.error(message)
    },
  })

  return (
    <ManageSection
      title="Shop staff"
      description="Assign workers to this shop by account email."
    >
      <Card>
        <CardHeader>
          <CardTitle>Assign worker</CardTitle>
          <CardDescription>
            Unassign endpoints are not available yet, so this page currently
            supports assignment only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="shop-worker-email">Staff email</Label>
            <Input
              id="shop-worker-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@example.com"
            />
          </div>
          <RequirePermission all={[SHOP_STAFF_PERMISSIONS.SHOP_STAFF_ASSIGN]}>
            <Button
              type="button"
              disabled={assignMutation.isPending}
              onClick={() => assignMutation.mutate({ email: email.trim() })}
            >
              Assign worker
            </Button>
          </RequirePermission>
          <RequirePermission
            all={[SHOP_STAFF_PERMISSIONS.SHOP_STAFF_READ]}
            fallback={null}
          >
            <p className="text-sm text-muted-foreground">
              Staff roster listing endpoint is not available from the backend yet.
            </p>
          </RequirePermission>
        </CardContent>
      </Card>
    </ManageSection>
  )
}
