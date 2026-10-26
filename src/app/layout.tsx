import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CookieConsent } from "@/components/privacy/cookie-consent"
import { UserPreferencesProvider } from "@/components/preferences/user-preferences-provider"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SITE } from "@/lib/marketing/content"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["monospace"],
})

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.university}`,
  description: SITE.tagline,
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <UserPreferencesProvider>
          <TooltipProvider>
            {children}
            <CookieConsent />
          </TooltipProvider>
          <Toaster />
        </UserPreferencesProvider>
      </body>
    </html>
  )
}

