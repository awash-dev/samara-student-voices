"use client"

import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SignOutButtonProps = {
  className?: string
  showLabel?: boolean
}

export function SignOutButton({ className, showLabel = false }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSignOut = () => {
    setLoading(true)

    // 1. Clear all client-accessible cookies immediately
    try {
      const cookies = document.cookie.split(";")
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim()
        if (name) {
          document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure`
          if (typeof window !== "undefined" && window.location.hostname) {
            document.cookie = `${name}=; path=/; domain=${window.location.hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            document.cookie = `${name}=; path=/; domain=${window.location.hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure`
          }
        }
      }
    } catch {}

    // 2. Clear client storage caches
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}

    // 3. Perform a full document navigation to the server-side /api/auth/sign-out endpoint.
    // This instructs the browser to make a top-level GET request to /api/auth/sign-out,
    // which responds with Set-Cookie deletion headers for all httpOnly & __Secure- cookies,
    // purges the database session, clears server-side caches, and issues an HTTP 302 redirect
    // directly to /auth/sign-in.
    window.location.href = "/api/auth/sign-out"
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      disabled={loading}
      onClick={handleSignOut}
      className={cn(className)}
      aria-label="Sign out"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="size-4" aria-hidden="true" />
      )}
      {showLabel ? (loading ? "Signing out…" : "Sign out") : null}
    </Button>
  )
}
