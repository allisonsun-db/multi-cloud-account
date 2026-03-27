"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import {
  SidebarCollapseIcon,
  SidebarExpandIcon,
  SparkleIcon,
} from "@/components/icons"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DatabricksLogo } from "./DatabricksLogo"
import { AppSwitcher } from "./AppSwitcher"

interface TopBarProps {
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  onMobileMenuToggle?: () => void
  userInitial?: string
  workspace?: string
  className?: string
}

export function TopBar({
  sidebarOpen = true,
  onToggleSidebar,
  onMobileMenuToggle,
  userInitial = "N",
  workspace,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 bg-secondary px-3",
        className
      )}
    >
      {/* Left: toggle + logo */}
      <div className="flex items-center gap-2">
        {/* Mobile: hamburger opens Sheet */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </Button>
        {/* Desktop: collapse/expand inline sidebar */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden md:flex"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <SidebarCollapseIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <SidebarExpandIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Link href="/"><DatabricksLogo height={18} workspaceName={workspace ?? "Databricks"} /></Link>
      </div>

      <div className="flex-1" aria-hidden />

      {/* Right: icon buttons + avatar */}
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-sm" aria-label="AI Assistant">
          <DbIcon icon={SparkleIcon} color="ai" size={16} />
        </Button>

        <AppSwitcher />

        {/* User avatar */}
        <button
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
          aria-label="User menu"
        >
          {userInitial}
        </button>
      </div>
    </header>
  )
}
