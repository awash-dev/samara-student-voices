"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Menu, PhoneCall, ShieldAlert, X } from "lucide-react"

import { EMERGENCY_CONTACTS, NAV_LINKS, SITE } from "@/lib/marketing/content"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sosModalOpen, setSosModalOpen] = useState(false)
  const [contacts, setContacts] = useState(EMERGENCY_CONTACTS)

  useEffect(() => {
    let active = true
    fetch("/api/platform-settings/emergency-contacts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.contacts) && data.contacts.length > 0) {
          setContacts(data.contacts)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 sm:gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={`${SITE.name} — home`}
          >
            <div className="relative flex size-8.5 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border shadow-xs bg-background">
              <Image
                src="/logo.png"
                alt={`${SITE.name} logo`}
                width={34}
                height={34}
                priority
                className="size-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-bold tracking-tight text-foreground">
                {SITE.shortName}
              </span>
              <span className="hidden truncate text-[10px] text-muted-foreground uppercase tracking-wide sm:block">
                Samara University
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* SOS Button */}
            <button
              type="button"
              onClick={() => setSosModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
            >
              <ShieldAlert className="size-3.5" />
              <span>Emergency</span>
            </button>

            <Link
              href="/auth/sign-in"
              className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Sign in
            </Link>

            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity sm:px-3"
            >
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Get Started</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-site-menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-site-menu"
            className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-b border-border bg-background px-4 py-3 lg:hidden"
          >
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSosModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400"
              >
                <ShieldAlert className="size-4" />
                Emergency SOS
              </button>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1.5">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground"
                >
                  Register Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6">
            <button
              type="button"
              onClick={() => setSosModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/15">
                <ShieldAlert className="size-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Emergency Contacts</h3>
                <p className="text-xs text-muted-foreground">Samara University Campus Safety</p>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              If you or someone around you is in immediate danger, contact these official channels:
            </p>

            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.role}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">{c.role}</p>
                    <p className="text-[11px] text-muted-foreground">{c.available}</p>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-2.5 py-1.5 text-xs font-bold text-white transition-colors"
                  >
                    <PhoneCall className="size-3" />
                    Call
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Link
                href="/auth/sign-up"
                onClick={() => setSosModalOpen(false)}
                className="flex-1 text-center rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                File Anonymous Report
              </Link>
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted text-muted-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
