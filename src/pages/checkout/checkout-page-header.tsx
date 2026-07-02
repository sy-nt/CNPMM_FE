export function CheckoutPageHeader() {
  return (
    <header className="space-y-2">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">
        Checkout
      </p>
      <h1 className="display-title text-3xl font-semibold text-foreground">
        Review your order
      </h1>
      <p className="text-sm text-muted-foreground">
        Choose a delivery address and shipping method to preview totals before
        placing your order.
      </p>
    </header>
  )
}
