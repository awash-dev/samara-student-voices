import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://samara-student-voices.vercel.app")

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/auth/sign-in", "/auth/sign-up", "/pending-approval"],
        disallow: [
          "/dashboard/*",
          "/executive/*",
          "/admin/*",
          "/superadmin/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
