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

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://su.greenafricafarm.com"

const SEO_KEYWORDS = [
  "samara student voices",
  "su student voices",
  "su uv report",
  "su report",
  "su voice",
  "samara university report",
  "samara university student voices",
  "samara university incident reporting",
  "samara university harassment report",
  "samara university student executive system",
  "samara university student union",
  "samara university complaints portal",
  "samara university grievance redressal",
  "samara university female student safety",
  "su girl safety hotline",
  "su emergency campus contacts",
  "samara peace forum",
  "samara university peace forum",
  "su student affairs",
  "samara university dean of student affairs",
  "samara university afar",
  "ethiopian university student reporting",
  "ethiopian university safe reporting",
  "anonymous student complaints ethiopia",
  "samara student council portal",
  "su executive portal",
  "su admin portal",
  "su superadmin master oversight",
  "student voice and safety platform",
  "awash dev",
  "mohammed hussen",
]

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Samara Student Voices — Student Voice & Safety Platform | Samara University",
    template: "%s | Samara Student Voices",
  },
  description:
    "Official confidential grievance redressal, female student safety, and campus feedback platform for Samara University (SU). Submit harassment reports and feedback securely and anonymously.",
  applicationName: "Samara Student Voices",
  authors: [{ name: "Mohammed Hussen (Awash Dev)", url: "https://portfolis.pro.et" }],
  creator: "Mohammed Hussen",
  publisher: "Samara University Peace Forum & Student Union",
  keywords: SEO_KEYWORDS,
  category: "Education & Campus Safety",
  classification: "University Incident Reporting & Student Welfare",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Samara Student Voices — Student Voice & Safety Platform",
    description:
      "Confidential harassment reporting, 24/7 female student safety hotline, and direct Student Executive Council feedback for Samara University students.",
    url: SITE_URL,
    siteName: "Samara Student Voices",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Samara Student Voices Emblem & Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Samara Student Voices — Samara University",
    description:
      "Safe, anonymous incident reporting and campus feedback for Samara University students.",
    creator: "@awash_dev",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YS4F_lYJ4egYwccTomcTh98KG9oDMNfLrFbHLcUjyLc",
  },
  other: {
    "university:name": "Samara University",
    "university:abbreviation": "SU",
    "platform:purpose": "Student Grievance Redressal, Harassment Reporting, Female Student Safety",
  },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Samara Student Voices",
        alternateName: [
          "SU Student Voices",
          "SU UV Report",
          "SU Report",
          "Samara University Student Voice Network",
        ],
        description:
          "Official student reporting and executive response platform for Samara University.",
        inLanguage: "en-US",
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: "Samara University",
        alternateName: ["SU", "Samara Univ"],
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/logo.png`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Samara",
          addressRegion: "Afar",
          addressCountry: "ET",
        },
      },
    ],
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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

