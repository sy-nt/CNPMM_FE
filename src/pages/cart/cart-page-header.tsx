export function CartPageHeader() {
  return (
    <header className="space-y-1">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">
        Cart
      </p>
      <h1 className="display-title text-3xl font-semibold text-foreground">
        Your cart
      </h1>
      <p className="text-sm text-muted-foreground">
        Review your items before continuing to checkout.
      </p>
    </header>
  )
}
