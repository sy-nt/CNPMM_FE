import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { ROLE_PERMISSIONS } from '#/lib/rbac/constants'
import { roleListQueryOptions, roleMutations, systemPermissionsQueryOptions } from '#/lib/query/role'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

type RoleCreateFormState = {
  name: string
  description: string
  permissionIds: ReadonlyArray<string>
}

const ROLE_LIST_QUERY = {
  page: 1,
  limit: 50,
  sort: 'desc' as const,
  orderBy: 'createdAt' as const,
}

const INITIAL_FORM_STATE: RoleCreateFormState = {
  name: '',
  description: '',
  permissionIds: [],
}

export function RolesPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [formState, setFormState] = useState<RoleCreateFormState>(INITIAL_FORM_STATE)

  const rolesQuery = useQuery(roleListQueryOptions(accessToken, ROLE_LIST_QUERY))
  const permissionsQuery = useQuery(systemPermissionsQueryOptions(accessToken))

  const createRoleMutation = useMutation(roleMutations(accessToken, queryClient).create)
  const deleteRoleMutation = useMutation(roleMutations(accessToken, queryClient).delete)

  const groupedPermissions = useMemo(() => {
    if (!permissionsQuery.data) return {}
    return permissionsQuery.data.reduce<Record<string, typeof permissionsQuery.data>>(
      (acc, permission) => {
        const [module] = permission.name.split(':')
        const key = module.length > 0 ? module : 'other'
        acc[key] = [...(acc[key] ?? []), permission]
        return acc
      },
      {},
    )
  }, [permissionsQuery.data])

  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading
  const isError = rolesQuery.isError || permissionsQuery.isError

  const handleCreateRole = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (createRoleMutation.isPending) return

    const name = formState.name.trim()
    if (!name) {
      toast.error('Role name is required.')
      return
    }
    if (formState.permissionIds.length === 0) {
      toast.error('Select at least one permission.')
      return
    }

    try {
      await createRoleMutation.mutateAsync({
        name,
        description: formState.description.trim() || undefined,
        permissionIds: formState.permissionIds,
      })
      setFormState(INITIAL_FORM_STATE)
      toast.success('Role created.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not create role.'))
    }
  }

  const handleDeleteRole = async (roleId: string): Promise<void> => {
    if (deleteRoleMutation.isPending) return

    try {
      await deleteRoleMutation.mutateAsync(roleId)
      toast.success('Role deleted.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not delete role.'))
    }
  }

  const togglePermission = (permissionId: string): void => {
    setFormState((prev) => {
      const exists = prev.permissionIds.includes(permissionId)
      return {
        ...prev,
        permissionIds: exists
          ? prev.permissionIds.filter((id) => id !== permissionId)
          : [...prev.permissionIds, permissionId],
      }
    })
  }

  return (
    <div className="space-y-8">
      <ManageSection
        title="Create role"
        description="Define a role and assign system permissions."
      >
        <RequirePermission
          all={[ROLE_PERMISSIONS.ROLE_CREATE]}
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Create access required</CardTitle>
                <CardDescription>
                  You can view roles but cannot create new ones.
                </CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <Card>
            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={handleCreateRole}>
                <div className="grid gap-2">
                  <Label htmlFor="role-name">Name</Label>
                  <Input
                    id="role-name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Role name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Input
                    id="role-description"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Optional description"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Permissions</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(groupedPermissions).map(
                      ([moduleName, permissions]) => (
                        <div key={moduleName} className="space-y-2 rounded-lg border p-3">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            {moduleName}
                          </p>
                          <div className="space-y-1.5">
                            {permissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={formState.permissionIds.includes(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                />
                                <span>{permission.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={createRoleMutation.isPending}>
                  {createRoleMutation.isPending ? 'Creating…' : 'Create role'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </RequirePermission>
      </ManageSection>

      <ManageSection
        title="Role list"
        description="Review existing roles and remove obsolete ones."
      >
        <ManageAsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={(rolesQuery.data?.items.length ?? 0) === 0}
          emptyTitle="No roles yet"
          emptyDescription="Create your first role to start assigning permissions."
        >
          <div className="grid gap-4">
            {rolesQuery.data?.items.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  <CardDescription>
                    {role.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {role.isSystemRole ? 'System role' : 'Custom role'}
                  </p>
                  <RequirePermission all={[ROLE_PERMISSIONS.ROLE_DELETE]}>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteRoleMutation.isPending || Boolean(role.isSystemRole)}
                      onClick={() => void handleDeleteRole(role.id)}
                    >
                      Delete
                    </Button>
                  </RequirePermission>
                </CardContent>
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
