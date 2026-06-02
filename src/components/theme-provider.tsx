import { useEffect } from 'react'
import { useStore } from '@tanstack/react-store'

import { Theme, selectTheme, themeStore } from '#/stores/theme.store'

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useStore(themeStore, selectTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === Theme.DARK)
    root.dataset.theme = theme
    root.style.colorScheme = theme
  }, [theme])

  return <>{children}</>
}
