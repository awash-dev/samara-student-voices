"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"

import { AuthDivider } from "@/components/auth/auth-divider"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { PasswordField } from "@/components/auth/password-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/client"
import {
  completeAuthSession,
  redirectByRole,
} from "@/lib/auth/client-session"

export function SignInForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (searchParams.get("error") === "google") {
      setError("Google sign-in was cancelled or failed. Please try again.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setError(authError.message || "Invalid email or password.")
        setLoading(false)
        return
      }

      if (!data) {
        setError("Sign in failed. Please try again.")
        setLoading(false)
        return
      }

      // After successful sign-in, wait a moment for session cookie to be set
      await new Promise(resolve => setTimeout(resolve, 300))

      const result = await completeAuthSession({
        defaultRoleOnCreate: "student",
      })

      if (!result.ok) {
        if (result.reason === "no_account") {
          window.location.href = "/auth/sign-up?from=google"
          return
        }
        setError("Failed to load your account. Please try again.")
        setLoading(false)
        return
      }

      redirectByRole(result.role, result.approved)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
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

        <GoogleAuthButton mode="signin" disabled={loading} onError={setError} />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@samara.edu.et"
              autoComplete="email"
              required
              className="h-10"
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Button
              variant="link"
              size="sm"
              nativeButton={false}
              render={<Link href="/auth/forgot-password" />}
              className="h-auto px-0 text-muted-foreground"
            >
              Forgot password?
            </Button>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <AuthDivider />

        <Button
          variant="outline"
          size="default"
          nativeButton={false}
          render={<Link href="/auth/sign-up" />}
          className="w-full"
        >
          Create an account
        </Button>
      </CardContent>
    </Card>
  )
}
