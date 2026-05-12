import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export function PasswordField({ id, label, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inputId = id ?? props.name ?? label
  const Icon = isVisible ? EyeOff : Eye

  return (
    <label className="grid gap-2 text-sm font-semibold text-ink dark:text-paper">
      <span>{label}</span>
      <span className="flex min-h-12 items-center rounded-2xl border border-ink/15 bg-white/75 px-4 focus-within:border-copper focus-within:ring-4 focus-within:ring-copper/20 dark:border-paper/15 dark:bg-paper/10">
        <input
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none dark:text-paper dark:placeholder:text-paper/45"
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          {...props}
        />
        <button
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="cursor-pointer rounded-full p-1.5 text-ink/60 transition hover:bg-ink/5 hover:text-ink dark:text-paper/65 dark:hover:bg-paper/10 dark:hover:text-paper"
          onClick={() => setIsVisible((value) => !value)}
          type="button"
        >
          <Icon aria-hidden="true" size={18} />
        </button>
      </span>
    </label>
  )
}
