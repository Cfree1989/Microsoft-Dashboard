"use client"

import Link from "next/link"
import { Plus, List } from "lucide-react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MOCK_USER } from "@/lib/mock-data"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <Header title="Student Portal" />

      <main className="flex flex-1 flex-col px-5 pt-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome, {MOCK_USER.firstName}!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        {/* Action Cards */}
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 md:flex-row md:items-stretch">
          {/* Submit New Request Card */}
          <Card className="flex-1 border border-border bg-card">
            <CardContent className="flex h-full flex-col items-center p-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Submit New Request
              </h3>
              <p className="mb-6 mt-2 flex-1 text-sm text-muted-foreground">
                Upload your 3D model file and submit a new print request
              </p>
              <Button asChild className="w-full" size="lg">
                <Link href="/submit">GET STARTED</Link>
              </Button>
            </CardContent>
          </Card>

          {/* OR Divider */}
          <div className="flex items-center justify-center md:flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-muted-foreground">
              OR
            </div>
          </div>

          {/* My Requests Card */}
          <Card className="flex-1 border border-border bg-card">
            <CardContent className="flex h-full flex-col items-center p-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <List className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                My Requests
              </h3>
              <p className="mb-6 mt-2 flex-1 text-sm text-muted-foreground">
                View status, confirm estimates, or manage your existing requests
              </p>
              <Button
                asChild
                className="w-full bg-success hover:bg-success/90"
                size="lg"
              >
                <Link href="/requests">VIEW REQUESTS</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Footer */}
        <p className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          Need help? Visit Room 145 Atkinson Hall or email fablab@lsu.edu
        </p>
      </main>

      <Navigation />
    </div>
  )
}
