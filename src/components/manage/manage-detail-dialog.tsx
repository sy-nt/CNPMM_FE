import type { ReactNode } from 'react'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { ScrollArea } from '#/components/ui/scroll-area'
import { cn } from '#/lib/utils'

export type ManageDetailFieldVariant = 'default' | 'mono' | 'badge'

export type ManageDetailField = {
  label: string
  value: ReactNode
  variant?: ManageDetailFieldVariant
  copyValue?: string
  badgeTone?: 'default' | 'secondary' | 'outline' | 'destructive'
}

export type ManageDetailSection = {
  title?: string
  description?: string
  fields: ReadonlyArray<ManageDetailField>
}

type ManageDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  badge?: ReactNode
  icon?: ReactNode
  fields?: ReadonlyArray<ManageDetailField>
  sections?: ReadonlyArray<ManageDetailSection>
  footer?: ReactNode
}

export function ManageDetailDialog({
  open,
  onOpenChange,
  title,
  description,
  badge,
  icon,
  fields,
  sections,
  footer,
}: ManageDetailDialogProps): ReactNode {
  const resolvedSections = _resolveSections(fields, sections)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="border-b bg-linear-to-br from-[var(--surface-strong)] to-[var(--surface)] px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              {icon ? (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80 shadow-xs">
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg">{title}</DialogTitle>
                  {badge}
                </div>
                {description ? (
                  <DialogDescription className="text-sm">
                    {description}
                  </DialogDescription>
                ) : null}
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[min(70vh,640px)]">
          <div className="space-y-4 px-6 py-5">
            {resolvedSections.map((section, index) => (
              <section
                key={section.title ?? `section-${index}`}
                className="rounded-xl border border-border/70 bg-card/60 p-4"
              >
                {section.title || section.description ? (
                  <div className="mb-3 space-y-1">
                    {section.title ? (
                      <h3 className="text-sm font-semibold text-foreground">
                        {section.title}
                      </h3>
                    ) : null}
                    {section.description ? (
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <dl className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div
                      key={field.label}
                      className={cn(
                        'space-y-1.5',
                        field.variant === 'mono' && 'sm:col-span-2',
                      )}
                    >
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {field.label}
                      </dt>
                      <dd className="text-sm text-foreground">
                        <ManageDetailFieldValue field={field} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          {footer ?? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ManageDetailFieldValue({
  field,
}: {
  field: ManageDetailField
}): ReactNode {
  if (field.variant === 'badge') {
    return (
      <Badge variant={field.badgeTone ?? 'secondary'}>
        {field.value}
      </Badge>
    )
  }

  if (field.variant === 'mono' || field.copyValue) {
    const copyText =
      field.copyValue ??
      (typeof field.value === 'string' ? field.value : undefined)
    return (
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs break-all">
          {field.value}
        </code>
        {copyText ? <CopyButton value={copyText} /> : null}
      </div>
    )
  }

  return field.value
}

function CopyButton({ value }: { value: string }): ReactNode {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={copied ? 'Copied' : 'Copy value'}
      onClick={() => void handleCopy()}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  )
}

function _resolveSections(
  fields: ReadonlyArray<ManageDetailField> | undefined,
  sections: ReadonlyArray<ManageDetailSection> | undefined,
): ReadonlyArray<ManageDetailSection> {
  if (sections && sections.length > 0) return sections
  if (fields && fields.length > 0) return [{ fields }]
  return []
}
