import { useMemo } from 'react'

import { sanitizeHtml } from '#/lib/sanitize'
import { cn } from '#/lib/utils'

type RichTextProps = {
  /** Untrusted HTML string from the server. Sanitised before rendering. */
  html: string
  className?: string
}

/**
 * Renders a server-supplied HTML string inside a `prose` typography container.
 * Always run user-authored markup through this component (never call
 * `dangerouslySetInnerHTML` ad-hoc) so sanitisation can't be skipped.
 */
export function RichText({ html, className }: RichTextProps) {
  const sanitized = useMemo(() => sanitizeHtml(html), [html])

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-foreground dark:prose-invert',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
