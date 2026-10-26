"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type PasswordFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  hint?: React.ReactNode
  className?: string
  inputClassName?: string
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = true,
  hint,
  className,
  inputClassName,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn("h-10 pr-10", inputClassName)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      {hint}
    </div>
  )
}
