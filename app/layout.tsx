import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Student Portal - FabLab 3D Print Request System",
  description: "Submit and track 3D print requests for the Digital Fabrication Lab",
}

export const viewport: Viewport = {
  themeColor: "#2D2D30",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
