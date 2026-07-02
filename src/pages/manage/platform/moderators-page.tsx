import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ManageActionDialog } from '#/components/manage/manage-action-dialog'
import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { USER_PERMISSIONS } from '#/lib/rbac/constants'
import { userMutations } from '#/lib/query/user'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

export function PlatformModeratorsPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const [assignOpen, setAssignOpen] = useState(false)
  const [email, setEmail] = useState('')

  const assignMutation = useMutation(
    userMutations(accessToken).assignModerator,
  )

  const handleAssign = async (): Promise<void> => {
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      toast.error('Email is required.')
      return
    }
    try {
      await assignMutation.mutateAsync({ email: normalized })
      toast.success('User promoted to platform moderator.')
      setEmail('')
      setAssignOpen(false)
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not assign moderator.'))
    }
  }

  return (
    <ManageSection
      title="Platform moderators"
      description="Promote users to the platform moderator role."
      actions={
        <RequirePermission all={[USER_PERMISSIONS.USER_UPDATE]}>
          <Button type="button" size="sm" onClick={() => setAssignOpen(true)}>
            Assign moderator
          </Button>
        </RequirePermission>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Assign platform moderator</CardTitle>
          <CardDescription>
            Promotes a user-role account to platform moderator. The user must
            not own a shop or be assigned to one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RequirePermission
            all={[USER_PERMISSIONS.USER_UPDATE]}
            fallback={
              <p className="text-sm text-muted-foreground">
                You need user update permission to assign moderators.
              </p>
            }
          >
            <Button type="button" onClick={() => setAssignOpen(true)}>
              Assign by email
            </Button>
          </RequirePermission>
        </CardContent>
      </Card>

      <ManageActionDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title="Assign platform moderator"
        description="Enter the email of a user-role account to promote."
        confirmLabel="Assign"
        onConfirm={() => void handleAssign()}
        confirmPending={assignMutation.isPending}
      >
        <div className="space-y-2">
          <Label htmlFor="moderator-email">User email</Label>
          <Input
            id="moderator-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
          />
        </div>
      </ManageActionDialog>
    </ManageSection>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
