import type { ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

type ManageActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  confirmDisabled?: boolean
  confirmPending?: boolean
  hideConfirm?: boolean
  destructive?: boolean
}

export function ManageActionDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmDisabled = false,
  confirmPending = false,
  hideConfirm = false,
  destructive = false,
}: ManageActionDialogProps): ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={confirmPending}
          >
            {cancelLabel}
          </Button>
          {hideConfirm ? null : (
            <Button
              type="button"
              variant={destructive ? 'destructive' : 'default'}
              disabled={confirmDisabled || confirmPending}
              onClick={onConfirm}
            >
              {confirmPending ? 'Saving…' : confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
