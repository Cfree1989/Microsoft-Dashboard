"use client"

import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { SubmitForm } from "@/components/submit-form"

export default function SubmitPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <Header title="Submit 3D Print Request" />

      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <SubmitForm />
        </div>
      </main>

      <Navigation />
    </div>
  )
}
