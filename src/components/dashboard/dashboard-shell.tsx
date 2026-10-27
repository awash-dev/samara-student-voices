"use client"

import Image from "next/image"
import Link from "next/link"
import { type ReactNode } from "react"
import { LogOut, Shield, User as UserIcon } from "lucide-react"

import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav"
import { DashboardGuide } from "@/components/dashboard/dashboard-guide"
import { SignOutButton } from "@/components/SignOutButton"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { ROLE_LABELS, type AppRole } from "@/lib/auth/roles"
import type { DashboardGuideRole } from "@/lib/dashboard/guide-content"
import { SITE } from "@/lib/marketing/content"
import type { SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export type NavItem = {
  id: string
  label: string
  icon: ReactNode
  badge?: number
}

type DashboardShellProps = {
  user: SessionUser
  role: AppRole
  title: string
  navItems: NavItem[]
  activeId: string
  onNavigate: (id: string) => void
  sidebarFooter?: ReactNode
  headerExtra?: ReactNode
  guideRole?: DashboardGuideRole
  children: ReactNode
  fullBleed?: boolean
  hideMobileNav?: boolean
}

function NavMenu({
  navItems,
  activeId,
  onNavigate,
}: Pick<DashboardShellProps, "navItems" | "activeId" | "onNavigate">) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarMenu className="gap-1 px-1">
      {navItems.map((item) => {
        const isActive = activeId === item.id
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.label}
              onClick={() => {
                onNavigate(item.id)
                if (isMobile) setOpenMobile(false)
              }}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 hover:text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <span className={cn("size-4 shrink-0 transition-transform", isActive && "scale-110")}>
                {item.icon}
              </span>
              <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span
                  className={cn(
                    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-xs group-data-[collapsible=icon]:hidden",
                    isActive
                      ? "bg-white text-primary"
                      : "bg-rose-500 text-white"
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export function DashboardShell({
  user,
  role,
  title,
  navItems,
  activeId,
  onNavigate,
  sidebarFooter,
  headerExtra,
  guideRole,
  children,
  fullBleed = false,
  hideMobileNav = false,
}: DashboardShellProps) {
  const userInitials = (user.name || user.email)
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-border/60 bg-card/60 backdrop-blur-xl flex flex-col">
        {/* Brand Header */}
        <SidebarHeader className="p-2 sm:p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/" />} className="rounded-xl hover:bg-muted/60 p-1.5 sm:p-2">
                <div className="relative flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground shadow-md shadow-primary/20 group-data-[collapsible=icon]:size-8">
                  <Shield className="size-5" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <div className="grid min-w-0 flex-1 text-left text-xs leading-tight ml-1 group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-extrabold text-foreground">{SITE.shortName}</span>
                  <span className="truncate text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
                    {SITE.university}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Navigation Content */}
        <SidebarContent className="px-2 pt-2 flex-1 scrollbar-none">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="pt-1">
              <NavMenu navItems={navItems} activeId={activeId} onNavigate={onNavigate} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Bottom Sidebar: User Account & Logout */}
        <SidebarFooter className="p-2.5 mt-auto group-data-[collapsible=icon]:p-1.5">
          <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-muted/40 p-2.5 shadow-xs group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none">
            {/* User Account Info */}
            <div
              onClick={() => {
                if (onNavigate) {
                  onNavigate(role === "superadmin" ? "profile" : "settings")
                }
              }}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-85 transition-opacity group-data-[collapsible=icon]:justify-center"
              title="Click to view Profile & Security"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-extrabold text-xs shadow-xs border border-primary/20">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate font-bold text-foreground text-xs leading-tight">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[8px] font-extrabold uppercase shrink-0 tracking-wide",
                      role === "superadmin" && "bg-purple-500/15 text-purple-700 dark:text-purple-300",
                      role === "admin" && "bg-blue-500/15 text-blue-700 dark:text-blue-300",
                      role === "executive" && "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
                      role === "student" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    )}
                  >
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                <p className="truncate text-[10px] text-muted-foreground font-mono mt-0.5" title={user.email}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Button below account */}
            <div className="pt-1.5 border-t border-border/50 group-data-[collapsible=icon]:hidden">
              <SignOutButton
                showLabel={true}
                className="w-full justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs py-1.5 h-auto shadow-xs transition-all cursor-pointer"
              />
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Main App Inset */}
      <SidebarInset className="m-0! p-0! rounded-none! shadow-none! h-svh max-h-svh min-h-0 flex flex-col overflow-hidden bg-background">
        {/* Top Header - Solid, zero leak, exact height */}
        <header className="h-14 sm:h-16 shrink-0 flex items-center gap-2 sm:gap-3 border-b border-border/70 bg-background px-3 sm:px-6 z-20">
          <SidebarTrigger
            type="button"
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
            className="-ml-1 size-9 shrink-0 rounded-lg hover:bg-muted"
          />

          {/* Breadcrumb / Page Title in Header */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <Badge
              variant="outline"
              className={cn(
                "hidden sm:inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide shadow-xs shrink-0",
                role === "superadmin" && "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
                role === "admin" && "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                role === "executive" && "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
                role === "student" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              )}
            >
              {ROLE_LABELS[role]}
            </Badge>

            <span className="hidden sm:inline text-muted-foreground/40 text-xs select-none">/</span>

            <span className="min-w-0 truncate text-xs sm:text-sm font-semibold text-foreground">
              {navItems.find((item) => item.id === activeId)?.label || title}
            </span>

            <div className="hidden min-w-0 shrink items-center sm:flex">{headerExtra}</div>
          </div>

          {/* User Email Pill */}
          <div className="flex shrink-0 items-center gap-2">
            {guideRole ? (
              <DashboardGuide role={guideRole} userId={user.id} onNavigate={onNavigate} />
            ) : null}
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-mono text-muted-foreground">
              <UserIcon className="size-3 text-primary" />
              <span className="max-w-[160px] truncate">{user.email}</span>
            </span>
          </div>
        </header>

        {/* Main Canvas Area */}
        <div
          className={cn(
            "dashboard-canvas relative flex min-h-0 min-w-0 flex-1 flex-col scrollbar-none",
            fullBleed
              ? cn(
                "overflow-hidden",
                hideMobileNav ? "pb-0" : "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
              )
              : "overflow-y-auto overscroll-contain scroll-pb-24 p-3 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:p-6 md:pb-24"
          )}
        >
          {/* Subtle ambient light mesh */}
          <div className="pointer-events-none absolute -top-12 right-0 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          {children}
        </div>

        {!hideMobileNav && (
          <DashboardMobileNav
            navItems={navItems}
            activeId={activeId}
            onNavigate={onNavigate}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
