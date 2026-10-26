"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Loader2, Phone, Plus, Save, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type EmergencyContact = {
  role: string
  phone: string
  available: string
  badge: string
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { role: "Campus Security Dispatch", phone: "+251 (0)33 666 0112", available: "24/7 Rapid Response", badge: "Immediate Threat" },
  { role: "Women Student Safety & Dorm Liaison", phone: "+251 (0)33 666 0199", available: "24/7 Female Officers", badge: "Girl Safety Hotline" },
  { role: "Executive Student Council Welfare", phone: "+251 (0)33 666 0240", available: "8:00 AM – 10:00 PM", badge: "Advocacy & Support" },
]

export function EmergencyContactsEditorCard({ className }: { className?: string }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/platform-settings/emergency-contacts")
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts)
      } else {
        setContacts(DEFAULT_CONTACTS)
      }
    } catch {
      setContacts(DEFAULT_CONTACTS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchContacts()
  }, [fetchContacts])

  const update = (index: number, field: keyof EmergencyContact, value: string) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    )
    setSaved(false)
    setError(null)
  }

  const addContact = () => {
    setContacts((prev) => [
      ...prev,
      { role: "", phone: "", available: "", badge: "" },
    ])
    setSaved(false)
  }

  const removeContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  const handleSave = async () => {
    if (contacts.some((c) => !c.role.trim() || !c.phone.trim())) {
      setError("Each contact must have a Role and Phone number.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/platform-settings/emergency-contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to save")
      }
    } catch {
      setError("Network error — please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className={cn("rounded-3xl border border-border/80 bg-card shadow-xs", className)}>
      <CardHeader className="p-5 pb-3 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex min-w-0 items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
            <Phone className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>Emergency Contacts</span>
          </CardTitle>
          <span className="shrink-0 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">
            Super Admin Only
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          These contacts appear in the public Emergency SOS modal and landing page. Editable only by Super Admin.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
            <Loader2 className="size-4 animate-spin" />
            Loading current contacts...
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Contact #{i + 1}
                  </span>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(i)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Role / Title *</label>
                    <Input
                      value={contact.role}
                      onChange={(e) => update(i, "role", e.target.value)}
                      placeholder="e.g. Campus Security Dispatch"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Phone Number *</label>
                    <Input
                      value={contact.phone}
                      onChange={(e) => update(i, "phone", e.target.value)}
                      placeholder="e.g. +251 (0)33 666 0112"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Availability</label>
                    <Input
                      value={contact.available}
                      onChange={(e) => update(i, "available", e.target.value)}
                      placeholder="e.g. 24/7 Rapid Response"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Badge Label</label>
                    <Input
                      value={contact.badge}
                      onChange={(e) => update(i, "badge", e.target.value)}
                      placeholder="e.g. Immediate Threat"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}

            {contacts.length < 6 && (
              <button
                type="button"
                onClick={addContact}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add Contact
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300">
            <X className="size-3.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border/50 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-muted-foreground">
            Changes apply immediately to the public SOS modal and landing page.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="h-9 w-full shrink-0 gap-1.5 rounded-xl text-xs font-bold sm:w-auto"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : saved ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Save className="size-3.5" />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
