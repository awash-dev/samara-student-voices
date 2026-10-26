import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Skeleton } from "@/components/ui/skeleton"
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated"

export const metadata: Metadata = {
  title: "Register Safe Student Account — Samara Student Voices",
  description:
    "Register with your Samara University email to access confidential incident reporting and student support.",
}

function SignUpFormFallback() {
  return <Skeleton className="h-56 w-full" aria-hidden="true" />
}

export default async function SignUpPage() {
  await redirectIfAuthenticated()

  return (
    <AuthShell title="Register" description="Choose your role, then create an account.">
      <Suspense fallback={<SignUpFormFallback />}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  )
}
