import { Link } from '@tanstack/react-router'
import { Home, Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/features/auth/AuthProvider'
import { cn } from '@/lib/cn'

type AppShellProps = {
  children?: ReactNode
  eyebrow?: string
  title?: string
}

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: UserRound, label: 'Profile', to: '/profile' },
] as const

export function AppShell({ children, eyebrow, title }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const shouldShowHeader = isAuthenticated || Boolean(eyebrow || title)

  return (
    <div className="min-h-screen px-3 py-3 sm:px-4">
      <div className="mx-auto flex max-w-7xl gap-3">
        {isAuthenticated ? (
          <aside
            className={cn(
              'fixed inset-y-3 left-3 z-40 w-20 rounded-[1.5rem] border border-ink/10 bg-white/75 p-3 shadow-[0_24px_80px_rgb(57_48_40/0.18)] backdrop-blur transition-transform lg:sticky lg:top-3 lg:block lg:h-[calc(100vh-1.5rem)] lg:translate-x-0 dark:border-paper/10 dark:bg-ink/85',
              isOpen ? 'translate-x-0' : '-translate-x-[120%]',
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <Link
                aria-label="Auxila home"
                className="grid size-12 place-items-center rounded-2xl bg-ink text-paper dark:bg-cream dark:text-ink"
                onClick={() => setIsOpen(false)}
                to="/"
              >
                <ShoppingBag aria-hidden="true" size={20} />
              </Link>
              <button
                aria-label="Close menu"
                className="grid size-10 cursor-pointer place-items-center rounded-full text-ink lg:hidden dark:text-paper"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            <nav className="mt-6 grid gap-2">
              {navItems.map((item) => (
                <Link
                  activeProps={{
                    className:
                      'border-ink bg-ink text-paper dark:border-cream dark:bg-cream dark:text-ink',
                  }}
                  aria-label={item.label}
                  className="grid size-12 place-items-center rounded-2xl border border-transparent text-ink/70 transition hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
                  key={item.to}
                  onClick={() => setIsOpen(false)}
                  to={item.to}
                  title={item.label}
                >
                  <item.icon aria-hidden="true" size={20} />
                </Link>
              ))}
            </nav>
          </aside>
        ) : null}

        {isAuthenticated && isOpen ? (
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 cursor-pointer bg-ink/35 lg:hidden"
            onClick={() => setIsOpen(false)}
            type="button"
          />
        ) : null}

        <main className="min-w-0 flex-1">
          {shouldShowHeader ? (
            <header className="mb-3 flex items-center justify-between gap-3 rounded-[1.25rem] border border-ink/10 bg-white/55 p-3 backdrop-blur dark:border-paper/10 dark:bg-paper/5">
              {isAuthenticated ? (
                <button
                  aria-label="Open menu"
                  className="grid size-11 cursor-pointer place-items-center rounded-full border border-ink/10 bg-white/60 text-ink lg:hidden dark:border-paper/15 dark:bg-paper/10 dark:text-paper"
                  onClick={() => setIsOpen(true)}
                  type="button"
                >
                  <Menu aria-hidden="true" size={20} />
                </button>
              ) : null}
              <div className="hidden sm:block">
                {eyebrow ? (
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-copper">
                    {eyebrow}
                  </p>
                ) : null}
                {title ? (
                  <p className="text-lg font-black text-ink dark:text-paper">
                    {title}
                  </p>
                ) : null}
              </div>
              <div className="ml-auto flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <ThemeToggle />
                    <Link
                      aria-label="Profile"
                      className="hidden size-11 cursor-pointer place-items-center rounded-full border border-ink/15 bg-paper/75 text-ink transition-colors hover:bg-white sm:grid dark:border-paper/15 dark:bg-paper/10 dark:text-paper dark:hover:bg-paper/15"
                      to="/profile"
                    >
                      <UserRound aria-hidden="true" size={17} />
                    </Link>
                  </>
                ) : null}
              </div>
            </header>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  )
}
