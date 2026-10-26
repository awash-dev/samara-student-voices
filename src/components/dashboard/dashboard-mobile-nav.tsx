"use client"

import type { NavItem } from "@/components/dashboard/dashboard-shell"
import { cn } from "@/lib/utils"

type DashboardMobileNavProps = {
  navItems: NavItem[]
  activeId: string
  onNavigate: (id: string) => void
}

export function DashboardMobileNav({
  navItems,
  activeId,
  onNavigate,
}: DashboardMobileNavProps) {
  const scrollable = navItems.length > 4

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 px-1.5 pt-1.5 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl supports-[padding:max(0px)]:pb-[max(0.4rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Dashboard navigation"
    >
      <div
        className={cn("h-[3.25rem] gap-1", scrollable ? "flex overflow-x-auto scrollbar-none" : "grid")}
        style={
          scrollable
            ? undefined
            : { gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }
        }
      >
        {navItems.map((item) => {
          const active = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition-all duration-200",
                scrollable ? "min-w-[3.5rem] flex-1 snap-start" : "min-w-0",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <span className="relative [&_svg]:size-[1.125rem]">
                {item.icon}
                {item.badge != null && item.badge > 0 ? (
                  <span
                    className={cn(
                      "absolute -right-2.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                      active
                        ? "bg-background text-primary"
                        : "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate leading-none">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
