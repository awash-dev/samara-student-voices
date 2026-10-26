import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Skeleton } from "@/components/ui/skeleton"
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated"
import { SITE } from "@/lib/marketing/content"

function SignInFormFallback() {
  return <Skeleton className="h-48 w-full" aria-hidden="true" />
}

export default async function SignInPage() {
  await redirectIfAuthenticated()

  return (
    <AuthShell title="Sign in" description={`${SITE.university} student account`}>
      <Suspense fallback={<SignInFormFallback />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  )
}
