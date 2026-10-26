"use client"

import { useState } from "react"
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react"

import { PasswordField } from "@/components/auth/password-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function passwordStrength(pw: string) {
  if (!pw.length) return null
  if (pw.length < 8) return "weak" as const
  if (pw.length < 12) return "fair" as const
  return "strong" as const
}

export function ChangePasswordCard({ className }: { className?: string }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const strength = passwordStrength(newPassword)
  const passwordsMatch = !confirmPassword.length || confirmPassword === newPassword

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to update password.")
        setLoading(false)
        return
      }

      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setSuccess(false), 5000)
    } catch {
      setError("Something went wrong. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("border-border/80 shadow-xs", className)}>
      <CardHeader className="p-4 sm:p-5 pb-2">
        <CardTitle className="text-sm font-extrabold flex items-center gap-2">
          <KeyRound className="size-4 text-primary" aria-hidden="true" />
          Update Password
        </CardTitle>
        <CardDescription className="text-xs">
          Keep your account secure with a strong password (minimum 8 characters).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        ) : null}

        {success ? (
          <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <AlertDescription className="text-xs">Your password has been successfully updated.</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <PasswordField
            id="current-password"
            label="Current password (if set)"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter current password"
            autoComplete="current-password"
          />

          <PasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
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
            id="confirm-new-password"
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
            size="sm"
            disabled={loading || !newPassword || newPassword.length < 8 || !passwordsMatch}
            className="w-full sm:w-auto h-9 text-xs font-bold rounded-xl cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-2" aria-hidden="true" />
                Updating…
              </>
            ) : (
              "Save new password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
