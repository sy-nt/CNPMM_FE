import { Link } from '@tanstack/react-router'

type AuthModeSwitchProps = {
  cta: string
  helper: string
  to: '/login' | '/sign-up'
}

export function AuthModeSwitch({ cta, helper, to }: AuthModeSwitchProps) {
  return (
    <div className="mt-6 rounded-full border border-ink/10 bg-white/60 p-1 dark:border-paper/10 dark:bg-paper/5">
      <Link
        className="group relative flex min-h-12 cursor-pointer items-center justify-between overflow-hidden rounded-full px-5 text-sm font-black text-ink transition-colors dark:text-paper"
        to={to}
      >
        <span className="absolute inset-y-1 left-1 w-1/2 rounded-full bg-cream transition-transform duration-300 ease-out group-hover:translate-x-[calc(100%-0.5rem)] dark:bg-copper" />
        <span className="relative z-10 text-ink/65 dark:text-paper/70">
          {helper}
        </span>
        <span className="relative z-10 rounded-full bg-ink px-4 py-2 text-paper shadow-[0_10px_24px_rgb(57_48_40/0.18)] transition-colors group-hover:bg-copper dark:bg-cream dark:text-ink">
          {cta}
        </span>
      </Link>
    </div>
  )
}
