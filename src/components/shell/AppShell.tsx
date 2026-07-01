"use client"

import * as React from "react"
import { TopBar } from "./TopBar"
import { Sidebar } from "./Sidebar"
import { GenieCodePanel } from "./GenieCodePanel"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { GenieTag } from "@/components/ai-elements/genie-prompt"

type GenieCodeDraft = {
  input: string
  tags?: GenieTag[]
  autoSubmit?: boolean
}

type GenieCodeContextValue = {
  openGenieCode: (draft?: GenieCodeDraft) => void
}

const GenieCodeContext = React.createContext<GenieCodeContextValue | null>(null)

export function useGenieCodePanel() {
  const context = React.useContext(GenieCodeContext)

  if (!context) {
    throw new Error("useGenieCodePanel must be used within AppShell")
  }

  return context
}

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
  const [isRail, setIsRail]           = React.useState(false)
  const [genieOpen, setGenieOpen]     = React.useState(false)
  const [genieDraft, setGenieDraft]   = React.useState<GenieCodeDraft | null>(null)
  const [genieDraftKey, setGenieDraftKey] = React.useState(0)

  const openGenieCode = React.useCallback((draft?: GenieCodeDraft) => {
    if (draft) {
      setGenieDraft(draft)
      setGenieDraftKey((key) => key + 1)
    }

    setGenieOpen(true)
  }, [])

  const toggleGenieCode = React.useCallback(() => {
    if (!genieOpen) {
      setGenieDraft(null)
      setGenieDraftKey((key) => key + 1)
    }

    setGenieOpen((open) => !open)
  }, [genieOpen])

  const closeGenieCode = React.useCallback(() => {
    setGenieOpen(false)
    setGenieDraft(null)
  }, [])

  const genieContextValue = React.useMemo(
    () => ({ openGenieCode }),
    [openGenieCode],
  )

  return (
    <div className={cn("flex h-dvh flex-col overflow-hidden bg-secondary", className)}>
      <GenieCodeContext.Provider value={genieContextValue}>
        <TopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
          onToggleGenie={toggleGenieCode}
          genieOpen={genieOpen}
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
            onLayoutChange={(layout) => setIsRail(layout === "rail")}
          />
        </div>

        <main className={cn(
          "flex-1 overflow-y-auto bg-background border border-border mb-2",
          genieOpen ? "mr-1" : "mr-2",
          isRail && sidebarOpen
            ? "rounded-tr-md rounded-br-md border-l-0"
            : "rounded-md",
          !sidebarOpen && "ml-2",
          mainClassName,
        )}>
          {children}
        </main>

          {genieOpen && (
            <GenieCodePanel
              key={genieDraftKey}
              open={genieOpen}
              onClose={closeGenieCode}
              initialInput={genieDraft?.input}
              initialTags={genieDraft?.tags}
              initialAutoSubmit={genieDraft?.autoSubmit}
              className="mb-2 mr-2 rounded-md border border-border"
            />
          )}
        </div>
      </GenieCodeContext.Provider>
    </div>
  )
}
