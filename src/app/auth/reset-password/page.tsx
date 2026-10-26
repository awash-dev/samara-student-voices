import { Suspense } from "react"
import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Skeleton } from "@/components/ui/skeleton"

function ResetPasswordFallback() {
  return <Skeleton className="h-64 w-full" aria-hidden="true" />
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create new password"
      description="Enter your new password below to regain access to your account."
    >
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
