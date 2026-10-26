"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { GoogleIcon } from "@/components/auth/google-icon"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/client"
import { storeOAuthPendingRole } from "@/lib/auth/client-session"
import { cn } from "@/lib/utils"

type GoogleAuthButtonProps = {
  mode: "signin" | "signup"
  role?: "student" | "executive"
  disabled?: boolean
  className?: string
  onError?: (message: string) => void
}

function getCallbackUrls() {
  const origin =
    typeof window !== "undefined" ? window.location.origin : ""
  return {
    callbackURL: `${origin}/auth/callback`,
    errorCallbackURL: `${origin}/auth/sign-in?error=google`,
  }
}

export function GoogleAuthButton({
  mode,
  role,
  disabled,
  className,
  onError,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    if (mode === "signup" && !role) {
      onError?.("Select Student or Executive before continuing with Google.")
      return
    }

    setLoading(true)
    onError?.("")

    try {
      if (mode === "signup" && role) {
        storeOAuthPendingRole(role)
      }

      const { error } = await authClient.signIn.social({
        provider: "google",
        ...getCallbackUrls(),
        requestSignUp: mode === "signup",
      })

      if (error) {
        onError?.(error.message || "Google sign-in failed. Please try again.")
        setLoading(false)
      }
    } catch {
      onError?.("Google sign-in failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={disabled || loading}
      onClick={handleGoogle}
      className={cn("w-full bg-background text-foreground hover:bg-muted", className)}
      aria-label={
        mode === "signup"
          ? "Continue with Google to register"
          : "Sign in with Google"
      }
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      {mode === "signup" ? "Continue with Google" : "Sign in with Google"}
    </Button>
  )
}
