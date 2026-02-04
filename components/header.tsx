"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  showRefresh?: boolean
  onRefresh?: () => void
}

export function Header({ title, showRefresh = false, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-15 items-center justify-between bg-secondary px-5">
      <h1 className="text-lg font-semibold text-secondary-foreground">
        {title}
      </h1>
      {showRefresh && onRefresh && (
        <Button
          variant="default"
          size="icon"
          onClick={onRefresh}
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
          aria-label="Refresh requests"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      )}
    </header>
  )
}
