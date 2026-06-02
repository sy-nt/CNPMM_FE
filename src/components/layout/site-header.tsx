import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  HelpCircle,
  Home,
  LogOut,
  Search,
  ShoppingCart,
  User,
  UserCircle,
} from 'lucide-react'

import { ThemeToggle } from '#/components/theme-toggle'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import { useClientStore } from '#/hooks/use-client-store'
import { useDebouncedValue } from '#/hooks/use-debounced-value'
import { useLogout } from '#/hooks/use-logout'
import { cn } from '#/lib/utils'
import { authStore, selectIsAuthenticated } from '#/stores/auth.store'

type SiteHeaderProps = {
  brandName?: string
  className?: string
}

const SEARCH_DEBOUNCE_MS = 350

export function SiteHeader({
  brandName = 'Nexus',
  className,
}: SiteHeaderProps) {
  const navigate = useNavigate()
  const isAuthenticated = useClientStore(
    authStore,
    selectIsAuthenticated,
    false,
  )
  const { logout, isPending: isLoggingOut } = useLogout()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS)

  const lastNavigatedRef = useRef<string>('')

  useEffect(() => {
    const trimmed = debouncedSearchTerm.trim()
    if (trimmed === lastNavigatedRef.current) return
    lastNavigatedRef.current = trimmed
    void navigate({
      to: '/',
      search: trimmed.length > 0 ? { search: trimmed } : {},
      replace: true,
    })
  }, [debouncedSearchTerm, navigate])

  const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const next = searchTerm.trim()
    if (next === lastNavigatedRef.current) return
    lastNavigatedRef.current = next
    void navigate({
      to: '/',
      search: next.length > 0 ? { search: next } : {},
    })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70',
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 lg:px-6">
        <Link
          to="/"
          aria-label={`${brandName} home`}
          className="flex shrink-0 items-center gap-2 no-underline"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <span className="font-display-title text-lg font-bold">N</span>
          </span>
          <span className="display-title hidden text-xl font-semibold text-foreground sm:inline">
            {brandName}
          </span>
        </Link>

        <form
          role="search"
          onSubmit={handleSearch}
          className="relative mx-auto flex w-full max-w-xl flex-1 items-center"
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
          />
          <Input
            id="site-search"
            type="search"
            name="search"
            placeholder="Search products…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 rounded-full bg-card pl-9"
          />
        </form>

        <nav aria-label="Primary" className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Home">
            <Link to="/">
              <Home aria-hidden="true" />
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Account menu"
                  type="button"
                >
                  <User aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to="/me">
                    <UserCircle aria-hidden="true" />
                    My account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help">
                    <HelpCircle aria-hidden="true" />
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isLoggingOut}
                  onSelect={(event) => {
                    event.preventDefault()
                    void logout()
                  }}
                >
                  <LogOut aria-hidden="true" />
                  {isLoggingOut ? 'Signing out…' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Sign in">
              <Link to="/sign-in">
                <User aria-hidden="true" />
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" size="icon" aria-label="Open cart">
            <Link to="/cart">
              <ShoppingCart aria-hidden="true" />
            </Link>
          </Button>

          <ThemeToggle className="ml-1" />
        </nav>
      </div>
    </header>
  )
}
