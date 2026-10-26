"use client"

import Link from "next/link"
import { useState } from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/client"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to send reset email.")
        return
      }
      setSent(true)
    } catch {
      setError("Something went wrong. Please check your network and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="space-y-6 pt-8 pb-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="default"
            nativeButton={false}
            render={<Link href="/auth/sign-in" />}
            className="w-full"
          >
            Back to sign in
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
              required
              className="h-10"
            />
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Send reset link"
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
