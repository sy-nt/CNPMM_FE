import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'cnpm.theme'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const [isMounted, setIsMounted] = useState(false)
  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : Moon

  useEffect(() => {
    setTheme(getInitialTheme())
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    applyTheme(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [isMounted, theme])

  return (
    <button
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/10 bg-white/55 px-4 text-sm font-bold text-ink transition hover:bg-white dark:border-paper/15 dark:bg-paper/10 dark:text-paper dark:hover:bg-paper/15"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      type="button"
    >
      <Icon aria-hidden="true" size={18} />
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
