import { Link } from '@tanstack/react-router'
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react'

import { AppShell } from '#/components/layout/app-shell'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function HelpPage() {
  return (
    <AppShell>
      <section className="rise-in space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Help center
          </p>
          <h1 className="display-title text-3xl font-semibold text-foreground">
            How can we help?
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Browse the basics below or reach out — we usually reply within one
            business day.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy aria-hidden="true" className="size-5 text-primary" />
                Getting started
              </CardTitle>
              <CardDescription>
                The essentials for your first session on Nexus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Sign in from the header to sync your cart and order history
                across devices. New here?{' '}
                <Link
                  to="/sign-up"
                  className="font-medium text-primary hover:underline"
                >
                  Create an account
                </Link>
                .
              </p>
              <p>
                Use the search bar to find products fast, or open the home page
                to browse categories.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
                Account &amp; security
              </CardTitle>
              <CardDescription>
                Manage your sign-in and recover access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Forgot your password?{' '}
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:underline"
                >
                  Reset it here
                </Link>
                .
              </p>
              <p>
                Didn&apos;t receive an activation email? Check your spam folder,
                then sign up again with the same address to resend it.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail aria-hidden="true" className="size-5 text-primary" />
              Still need help?
            </CardTitle>
            <CardDescription>
              Drop us a note and a human will get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default">
              <a href="mailto:support@nexus.example">Email support</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  )
}
