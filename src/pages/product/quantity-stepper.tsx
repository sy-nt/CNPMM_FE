import { Minus, Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'

export const QUANTITY_MIN = 1

type QuantityStepperProps = {
  value: number
  max: number
  onChange: (next: number) => void
  disabled?: boolean
}

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  const decrement = (): void => {
    onChange(Math.max(QUANTITY_MIN, value - 1))
  }
  const increment = (): void => {
    onChange(Math.min(max, value + 1))
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={decrement}
        disabled={disabled || value <= QUANTITY_MIN}
        aria-label="Decrease quantity"
        className="rounded-r-none"
      >
        <Minus aria-hidden="true" />
      </Button>
      <span
        aria-live="polite"
        className="min-w-10 select-none text-center text-sm font-medium"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="rounded-l-none"
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  )
}
