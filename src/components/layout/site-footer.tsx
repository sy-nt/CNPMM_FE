import { Link } from '@tanstack/react-router'

import { cn } from '#/lib/utils'

type SiteFooterProps = {
  brandName?: string
  className?: string
}

export function SiteFooter({
  brandName = 'Nexus',
  className,
}: SiteFooterProps) {
  const year = new Date().getFullYear()
  return (
    <footer
      className={cn(
        'site-footer mt-auto w-full',
        'border-t border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <span className="font-display-title text-lg font-bold">N</span>
          </span>
          <div className="flex flex-col">
            <span className="display-title text-lg font-semibold text-foreground">
              {brandName}
            </span>
            <span className="text-xs text-muted-foreground">
              © {year} {brandName}. All rights reserved.
            </span>
          </div>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-1">
          <Link
            to="/about"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Contact
          </Link>
          <Link
            to="/help"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Help
          </Link>
        </nav>
      </div>
    </footer>
  )
}
