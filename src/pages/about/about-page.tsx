import { Link } from '@tanstack/react-router'
import { Compass, HeartHandshake, Sparkles, Users } from 'lucide-react'

import { AppShell } from '#/components/layout/app-shell'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function AboutPage() {
  return (
    <AppShell>
      <section className="rise-in space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            About Nexus
          </p>
          <h1 className="display-title text-3xl font-semibold text-foreground">
            A storefront built around the people who use it
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Nexus is a marketplace project crafted by the CNPM team — we
            connect independent shops with curious shoppers and keep the
            experience honest, fast, and pleasant on every device.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass aria-hidden="true" className="size-5 text-primary" />
                Our mission
              </CardTitle>
              <CardDescription>What gets us up in the morning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Make discovering quality products feel effortless, and give
                small shops a fair stage to stand on.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles aria-hidden="true" className="size-5 text-primary" />
                What's special
              </CardTitle>
              <CardDescription>The promises we keep.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Curated catalogues, transparent pricing, and a checkout that
                respects your time. No dark patterns, no upsell mazes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users aria-hidden="true" className="size-5 text-primary" />
                The team
              </CardTitle>
              <CardDescription>Small, focused, hands-on.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                A handful of engineers, designers, and operators based in Ho
                Chi Minh City — building Nexus the way we'd want a storefront
                to be built for us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshake
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
                Want to chat?
              </CardTitle>
              <CardDescription>We answer real emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Questions, feedback, or partnership ideas — pick the channel
                that suits you.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="default">
                  <Link to="/contact">Contact us</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/help">Visit help center</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  )
}
