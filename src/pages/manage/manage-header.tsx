import { useClientStore } from '#/hooks/use-client-store'
import { authStore, selectRole } from '#/stores/auth.store'

export function ManageHeader() {
  const role = useClientStore(authStore, selectRole, null)
  const roleLabel = role?.name.replaceAll('_', ' ') ?? 'Manager'

  return (
    <header className="space-y-1">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">
        Manager
      </p>
      <h1 className="display-title text-3xl font-semibold text-foreground capitalize">
        {roleLabel}
      </h1>
      {role?.description ? (
        <p className="text-sm text-muted-foreground">{role.description}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Tools and modules granted to your role
        </p>
      )}
    </header>
  )
}
