import type { ReactNode } from 'react'

type AuthCardProps = {
  children: ReactNode
  eyebrow: string
  title: string
}

export function AuthCard({ children, eyebrow, title }: AuthCardProps) {
  return (
    <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-ink/10 bg-white/50 shadow-[0_24px_80px_rgb(57_48_40/0.18)] backdrop-blur md:grid-cols-[0.95fr_1.05fr] dark:border-paper/10 dark:bg-paper/5">
      <div className="relative hidden min-h-[34rem] overflow-hidden bg-ink p-10 text-paper md:block dark:bg-black/20">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(90deg,rgb(251_226_167/0.16)_1px,transparent_1px),linear-gradient(rgb(251_226_167/0.16)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative z-10 flex h-full items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cream/70">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-sm text-5xl font-black leading-none">
              {title}
            </h1>
          </div>
        </div>
      </div>
      <div className="p-6 sm:p-8 lg:p-10">{children}</div>
    </section>
  )
}
