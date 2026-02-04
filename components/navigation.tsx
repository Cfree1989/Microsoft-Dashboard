"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, List } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "New Request",
    href: "/submit",
    icon: Plus,
  },
  {
    name: "My Requests",
    href: "/requests",
    icon: List,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-secondary">
      <div className="flex h-15 items-center justify-center gap-2 px-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 max-w-[200px] items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-info text-info-foreground"
                  : "bg-[rgb(60,60,65)] text-white hover:bg-[rgb(70,70,75)]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
