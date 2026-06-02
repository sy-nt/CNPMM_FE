import { Moon, Sun } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { useClientStore } from '#/hooks/use-client-store'
import { cn } from '#/lib/utils.ts'
import { selectIsDark, themeStore, toggleTheme } from '#/stores/theme.store'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  // Theme is restored from `localStorage` on the client only — render the
  // light-mode aria attributes during SSR + the first client render so we
  // match the markup React produced on the server.
  const isDark = useClientStore(themeStore, selectIsDark, false)

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={cn('relative', className)}
    >
      <Sun
        aria-hidden="true"
        className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
      />
    </Button>
  )
}
