import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

import { AppShell } from '#/components/layout/app-shell'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function ContactPage() {
  return (
    <AppShell>
      <section className="rise-in space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Contact us
          </p>
          <h1 className="display-title text-3xl font-semibold text-foreground">
            We'd love to hear from you
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Questions about an order, a product, or working together? Reach
            out and a real person will reply within one business day.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail aria-hidden="true" className="size-5 text-primary" />
                Email
              </CardTitle>
              <CardDescription>For everything that isn't urgent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Drop us a note — we read every message and reply within one
                business day.
              </p>
              <Button asChild variant="default">
                <a href="mailto:hello@nexus.example">hello@nexus.example</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone aria-hidden="true" className="size-5 text-primary" />
                Phone
              </CardTitle>
              <CardDescription>Mon – Fri, 9:00 to 18:00 (GMT+7).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Prefer to talk? Our support team picks up during business
                hours.
              </p>
              <Button asChild variant="outline">
                <a href="tel:+842899998888">+84 28 9999 8888</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-5 text-primary" />
                Office
              </CardTitle>
              <CardDescription>Visit us in Ho Chi Minh City.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>123 Le Loi Street</p>
              <p>District 1, Ho Chi Minh City</p>
              <p>Vietnam</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
                Press &amp; partnerships
              </CardTitle>
              <CardDescription>
                Working on a story or a collab idea?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Reach our partnerships team directly for press kits,
                co-marketing, and collaboration enquiries.
              </p>
              <Button asChild variant="outline">
                <a href="mailto:partners@nexus.example">
                  partners@nexus.example
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  )
}
