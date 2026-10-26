"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  GraduationCap,
  Loader2,
  Shield,
} from "lucide-react"

import { AuthDivider } from "@/components/auth/auth-divider"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { PasswordField } from "@/components/auth/password-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

type Role = "student" | "executive"
type Step = "role" | "form"

function passwordStrength(pw: string) {
  if (!pw.length) return null
  if (pw.length < 8) return "weak" as const
  if (pw.length < 12) return "fair" as const
  return "strong" as const
}

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>("role")
  const [role, setRole] = useState<Role>("student")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const strength = passwordStrength(password)
  const passwordsMatch =
    !confirmPassword.length || confirmPassword === password

  useEffect(() => {
    if (searchParams.get("from") === "google") {
      setError(
        "Your Google account is not registered yet. Select a role below, then continue with Google or use email."
      )
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter your full name.")
      return
    }
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setError(authError.message || "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      if (data) {
        // Wait for session cookie to be set
        await new Promise(resolve => setTimeout(resolve, 300))

        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        })

        if (!syncRes.ok) {
          const err = await syncRes.json()
          setError(
            err.error ||
              "Account created but setup failed. Please contact support."
          )
          setLoading(false)
          return
        }

        router.push("/pending-approval")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "role") {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Choose account type</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick Student or Executive. We will email your registered address when
            your account is approved.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  id: "student" as const,
                  label: "Student",
                  description: "Report harassment and send feedback privately",
                  icon: GraduationCap,
                },
                {
                  id: "executive" as const,
                  label: "Student Executive",
                  description: "Review student messages and reply securely",
                  icon: Shield,
                },
              ] as const
            ).map((option) => {
              const selected = role === option.id
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRole(option.id)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-200",
                    "hover:border-primary/40 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:bg-muted",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card"
                  )}
                  aria-pressed={selected}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg",
                      selected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  ) : null}
                </button>
              )
            })}
          </div>

          <Alert>
            <AlertDescription className="text-xs leading-relaxed">
              After registration, a confirmation email is sent to your address.
              Sign in is enabled only after an administrator approves your account.
            </AlertDescription>
          </Alert>

          <GoogleAuthButton
            mode="signup"
            role={role}
            disabled={loading}
            onError={setError}
          />

          <AuthDivider />

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => {
              setError("")
              setStep("form")
            }}
          >
            Continue with email as {role === "student" ? "Student" : "Executive"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Button
              variant="link"
              size="sm"
              nativeButton={false}
              render={<Link href="/auth/sign-in" />}
              className="h-auto px-0"
            >
              Sign in
            </Button>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setStep("role")
            setError("")
          }}
          aria-label="Back to role selection"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-semibold">Account details</CardTitle>
          <Badge variant="secondary" className="mt-2 capitalize">
            {role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <GoogleAuthButton
          mode="signup"
          role={role}
          disabled={loading}
          onError={setError}
        />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              required
              className="h-10"
            />
          </div>

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
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat password"
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
            disabled={loading || !passwordsMatch}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            render={<Link href="/auth/sign-in" />}
            className="h-auto px-0"
          >
            Sign in instead
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}
