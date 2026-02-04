"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { RequestsList } from "@/components/requests-list"

export default function RequestsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <Header
        title="My Print Requests"
        showRefresh
        onRefresh={handleRefresh}
      />

      <main className="flex-1 px-5 py-6">
        <RequestsList key={refreshKey} />
      </main>

      <Navigation />
    </div>
  )
}
