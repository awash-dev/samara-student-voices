"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react"

import { PasswordField } from "@/components/auth/password-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function passwordStrength(pw: string) {
  if (!pw.length) return null
  if (pw.length < 8) return "weak" as const
  if (pw.length < 12) return "fair" as const
  return "strong" as const
}

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const emailHint = searchParams.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const strength = passwordStrength(password)
  const passwordsMatch = !confirmPassword.length || confirmPassword === password

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Reset token is missing. Please use the link sent to your email.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
          email: emailHint,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to reset password. Please try again.")
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="space-y-6 pt-8 pb-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">Invalid Reset Link</p>
            <p className="text-sm text-muted-foreground">
              No reset token found in this link. Please request a new password reset link.
            </p>
          </div>
          <Button
            variant="default"
            size="default"
            nativeButton={false}
            render={<Link href="/auth/forgot-password" />}
            className="w-full"
          >
            Request New Link
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="space-y-6 pt-8 pb-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">Password reset complete</p>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </div>
          <Button
            variant="default"
            size="default"
            nativeButton={false}
            render={<Link href="/auth/sign-in" />}
            className="w-full"
          >
            Sign in now
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardContent className="space-y-6 pt-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {emailHint ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <KeyRound className="size-3.5 shrink-0" />
            <span>Resetting password for: <strong className="text-foreground">{emailHint}</strong></span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="newPassword"
            label="New password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            hint={
              strength ? (
                <div className="space-y-2">
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        strength === "weak" && "w-1/3 bg-destructive",
                        strength === "fair" && "w-2/3 bg-amber-500",
                        strength === "strong" && "w-full bg-emerald-600"
                      )}
                    />
                  </div>
                  <p className="text-xs capitalize text-muted-foreground">
                    {strength} password
                  </p>
                </div>
              ) : null
            }
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat new password"
            autoComplete="new-password"
            inputClassName={
              confirmPassword && !passwordsMatch
                ? "border-destructive aria-invalid:border-destructive"
                : undefined
            }
          />

          {confirmPassword && !passwordsMatch ? (
            <p className="text-xs text-destructive">Passwords do not match</p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !passwordsMatch || password.length < 8}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Updating password…
              </>
            ) : (
              "Set new password"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            render={<Link href="/auth/sign-in" />}
            className="h-auto px-0"
          >
            Back to sign in
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}
