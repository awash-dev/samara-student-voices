import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Skeleton } from "@/components/ui/skeleton"
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated"

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
