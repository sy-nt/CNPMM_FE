import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { USER_PERMISSIONS } from '#/lib/rbac/constants'
import { adminUserListQueryOptions } from '#/lib/query/admin-user'
import { userMutations } from '#/lib/query/user'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const USER_LIST_QUERY = {
  limit: 30,
  sort: 'desc' as const,
}

export function UsersPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')

  const usersQuery = useQuery(adminUserListQueryOptions(accessToken, USER_LIST_QUERY))
  const blockMutation = useMutation(userMutations(accessToken, queryClient).block)

  const handleBlockUser = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (blockMutation.isPending) return

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      toast.error('Email is required.')
      return
    }

    try {
      await blockMutation.mutateAsync({ email: normalizedEmail })
      setEmail('')
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User blocked.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not block this user.'))
    }
  }

  return (
    <div className="space-y-8">
      <ManageSection
        title="Block user"
        description="Block access for users violating platform policies."
      >
        <RequirePermission
          all={[USER_PERMISSIONS.USER_BLOCK]}
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Block access required</CardTitle>
                <CardDescription>
                  You can browse users but cannot block accounts.
                </CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <Card>
            <CardContent className="pt-6">
              <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleBlockUser}>
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="block-email">User email</Label>
                  <Input
                    id="block-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <Button type="submit" variant="destructive" disabled={blockMutation.isPending}>
                  {blockMutation.isPending ? 'Blocking…' : 'Block user'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </RequirePermission>
      </ManageSection>

      <ManageSection
        title="User directory"
        description="Recent platform users available to admin moderation."
      >
        <ManageAsyncState
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          isEmpty={(usersQuery.data?.items.length ?? 0) === 0}
          emptyTitle="No users found"
          emptyDescription="Users will appear here after account creation."
        >
          <div className="grid gap-4">
            {usersQuery.data?.items.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="text-base">{user.email}</CardTitle>
                  <CardDescription>
                    {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'No profile name'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ManageAsyncState>
      </ManageSection>
    </div>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
