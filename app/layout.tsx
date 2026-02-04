import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Student Portal | FabLab 3D Print Requests",
  description:
    "Submit and track your 3D print requests at LSU's Digital Fabrication Lab. Upload your models, view estimates, and manage your print queue.",
}

export const viewport: Viewport = {
  themeColor: "#2d2d30",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
