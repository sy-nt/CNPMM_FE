import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function EmptyCart() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <ShoppingCart aria-hidden="true" className="size-8" />
        </span>
        <CardTitle>Your cart is empty</CardTitle>
        <CardDescription>
          Browse the catalogue and add a few favourites to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild>
          <Link to="/">Continue shopping</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
