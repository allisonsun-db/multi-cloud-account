"use client"

import * as React from "react"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DbIcon } from "@/components/ui/db-icon"
import {
  SidebarClosedIcon,
  SidebarOpenIcon,
  GenieCodeIcon,
  GearIcon,
} from "@/components/icons"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DatabricksLogo } from "./DatabricksLogo"
import { AppSwitcher } from "./AppSwitcher"

interface TopBarProps {
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  onMobileMenuToggle?: () => void
  onToggleGenie?: () => void
  genieOpen?: boolean
  userInitial?: string
  workspace?: string
  className?: string
}

export function TopBar({
  sidebarOpen = true,
  onToggleSidebar,
  onMobileMenuToggle,
  onToggleGenie,
  genieOpen = false,
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
            <SidebarOpenIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <SidebarClosedIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Link href="/" className="flex items-center">
          <DatabricksLogo height={16} />
        </Link>
        <span className="h-5 w-px bg-muted-foreground/40" aria-hidden />
        <span className="text-sm font-semibold text-foreground">Admin</span>
      </div>

      <div className="flex-1" aria-hidden />

      {/* Right: icon buttons + avatar */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open Genie Code"
          onClick={onToggleGenie}
          className={cn(genieOpen && "bg-muted")}
        >
          <DbIcon icon={GenieCodeIcon} color="ai" size={16} />
        </Button>

        <AppSwitcher />

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
              aria-label="User menu"
            >
              {userInitial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <GearIcon className="h-4 w-4 text-muted-foreground" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
