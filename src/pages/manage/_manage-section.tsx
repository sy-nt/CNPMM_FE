import type { ReactNode } from 'react'

type ManageSectionProps = {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function ManageSection({
  title,
  description,
  actions,
  children,
}: ManageSectionProps): ReactNode {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
