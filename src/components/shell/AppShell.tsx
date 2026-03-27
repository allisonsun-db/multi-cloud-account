"use client"

import * as React from "react"
import { TopBar } from "./TopBar"
import { Sidebar } from "./Sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface AppShellProps {
  activeItem?: string
  onNavigate?: (id: string) => void
  userInitial?: string
  workspace?: string
  children: React.ReactNode
  className?: string
  mainClassName?: string
}

export function AppShell({
  activeItem,
  onNavigate,
  userInitial,
  workspace,
  children,
  className,
  mainClassName,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)   // desktop inline
  const [mobileOpen, setMobileOpen]   = React.useState(false)  // mobile sheet

  return (
    <div className={cn("flex h-dvh flex-col overflow-hidden bg-secondary", className)}>
      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onMobileMenuToggle={() => setMobileOpen((v) => !v)}
        userInitial={userInitial}
        workspace={workspace}
      />

      {/* Mobile sidebar — Sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[220px] p-0 bg-secondary border-r-0"
        >
          <Sidebar
            open={true}
            activeItem={activeItem}
            onNavigate={(id) => { setMobileOpen(false); onNavigate?.(id) }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — inline, hidden on mobile */}
        <div className="hidden md:contents">
          <Sidebar
            open={sidebarOpen}
            activeItem={activeItem}
            onNavigate={onNavigate}
          />
        </div>

        <main className={cn(
          "flex-1 overflow-y-auto rounded-md bg-background border border-border mb-2 mr-2",
          !sidebarOpen && "ml-2",
          mainClassName,
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
