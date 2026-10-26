import type { ReactNode } from "react"

import { SupportProvider } from "@/components/layout/support-provider"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SupportProvider />
      {children}
    </>
  )
}
