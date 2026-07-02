import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { notificationMutations } from '#/lib/query/notification'

type NotificationMarkAllReadButtonProps = {
  accessToken: string
  unreadCount: number
  onSuccess?: () => void | Promise<void>
  variant?: 'ghost' | 'link' | 'outline'
  size?: 'default' | 'sm'
  className?: string
}

export function NotificationMarkAllReadButton({
  accessToken,
  unreadCount,
  onSuccess,
  variant = 'ghost',
  size = 'sm',
  className,
}: NotificationMarkAllReadButtonProps) {
  const queryClient = useQueryClient()
  const markAllRead = useMutation(
    notificationMutations(accessToken, queryClient).markAllRead,
  )

  if (unreadCount <= 0) return null

  const handleClick = async (): Promise<void> => {
    try {
      const result = await markAllRead.mutateAsync(undefined)
      toast.success(
        result.updatedCount > 0
          ? `Marked ${result.updatedCount} notification${result.updatedCount === 1 ? '' : 's'} as read`
          : 'All notifications are already read',
      )
      await onSuccess?.()
    } catch {
      toast.error('Could not mark notifications as read')
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={markAllRead.isPending}
      onClick={() => {
        void handleClick()
      }}
    >
      {markAllRead.isPending ? (
        <>
          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          Marking…
        </>
      ) : (
        'Mark all read'
      )}
    </Button>
  )
}
