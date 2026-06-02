import { Store } from '@tanstack/store'

export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type Theme = (typeof Theme)[keyof typeof Theme]

export type ThemeState = {
  theme: Theme
}

export const THEME_STORAGE_KEY = 'cnpm.theme'
const _defaultTheme: Theme = Theme.LIGHT

function _isTheme(value: unknown): value is Theme {
  return value === Theme.LIGHT || value === Theme.DARK
}

function _readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    return _isTheme(raw) ? raw : null
  } catch {
    return null
  }
}

function _detectSystemTheme(): Theme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return Theme.DARK
  }
  return _defaultTheme
}

export function detectInitialTheme(): Theme {
  return _readStoredTheme() ?? _detectSystemTheme()
}

const _initialState: ThemeState = {
  theme: detectInitialTheme(),
}

export const themeStore = new Store<ThemeState>(_initialState)

export function setTheme(theme: Theme): void {
  themeStore.setState(() => ({ theme }))
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently
  }
}

export function toggleTheme(): void {
  setTheme(themeStore.state.theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)
}

export const selectTheme = (state: ThemeState): Theme => state.theme
export const selectIsDark = (state: ThemeState): boolean =>
  state.theme === Theme.DARK
