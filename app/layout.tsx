import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "CaesarX - Advanced Trading Platform",
  description: "Professional crypto trading and DeFi platform",
  icons: {
    icon: "/caesarx-logo.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/caesarx-logo.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-black text-white antialiased`} suppressHydrationWarning={true}>
        <div className="min-h-screen bg-black">
          <Navigation />
          <main className="p-3 sm:p-6 pb-20">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
