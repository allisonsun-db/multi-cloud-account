"use client"

import * as React from "react"
import { Search, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  workspace?: string
  userInitial?: string
  className?: string
}

export function TopBar({
  sidebarOpen = true,
  onToggleSidebar,
  onMobileMenuToggle,
  workspace = "Production",
  userInitial = "N",
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
        <Link href="/"><DatabricksLogo height={18} /></Link>
      </div>

      {/* Center: search (hidden on mobile) */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <div className="relative flex w-full max-w-[480px] items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 rounded bg-background border-border pl-9 pr-14 text-xs placeholder:text-muted-foreground"
            placeholder="Search data, notebooks, recents, and more..."
          />
          <kbd className="pointer-events-none absolute right-3 flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <span>⌘</span>
            <span>P</span>
          </kbd>
        </div>
      </div>

      {/* Spacer on mobile so right section stays right-aligned */}
      <div className="flex-1 md:hidden" />

      {/* Right: workspace selector + icon buttons + avatar */}
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="sm" className="hidden md:flex gap-1 px-2">
          <span className="text-xs">{workspace}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>

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
