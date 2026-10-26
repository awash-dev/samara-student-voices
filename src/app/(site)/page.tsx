import type { Metadata } from "next"
import { LandingPage } from "@/components/marketing/landing-page"

export const metadata: Metadata = {
  title: "Samara Student Voices — Report Harassment & Campus Issues Safely",
  description:
    "Confidential reporting platform for Samara University students. Report harassment, campus safety issues, or executive feedback anonymously.",
  keywords: [
    "samara student voices",
    "su student voices",
    "su uv report",
    "su report",
    "samara university reporting portal",
  ],
}

export default function HomePage() {
  return <LandingPage />
}
