import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner } from 'sonner'
import type { ToasterProps } from 'sonner'

import { useClientStore } from '#/hooks/use-client-store'
import { Theme, selectTheme, themeStore } from '#/stores/theme.store'

const Toaster = ({ ...props }: ToasterProps) => {
  // Sonner stamps `data-theme` / `class` on its toaster container based on
  // the `theme` prop, so the value has to match between SSR and the first
  // client render. Use the neutral default until hydration commits.
  const theme = useClientStore(themeStore, selectTheme, Theme.LIGHT)

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
