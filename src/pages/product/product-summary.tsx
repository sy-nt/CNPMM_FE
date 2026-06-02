type ProductSummaryProps = {
  name: string
  formattedPrice: string | null
  isActive: boolean
}

export function ProductSummary({
  name,
  formattedPrice,
  isActive,
}: ProductSummaryProps) {
  return (
    <header className="space-y-2">
      <h1 className="display-title text-3xl font-semibold text-foreground">
        {name}
      </h1>
      {formattedPrice ? (
        <p className="text-2xl font-semibold text-primary">{formattedPrice}</p>
      ) : null}
      {!isActive ? (
        <p className="text-sm font-medium text-destructive">
          This product is currently unavailable.
        </p>
      ) : null}
    </header>
  )
}
