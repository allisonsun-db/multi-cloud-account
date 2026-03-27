"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { DbIcon } from "@/components/ui/db-icon"
import {
  WorkspacesIcon,
  CatalogIcon,
  ChartLineIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CloudIcon,
  GiftIcon,
  GearIcon,
} from "@/components/icons"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  iconColor?: "default" | "muted" | "primary" | "ai"
  href?: string
}

type NavSection = {
  label?: string
  items: NavItem[]
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { id: "workspaces",       label: "Workspaces",       icon: WorkspacesIcon,  href: "/workspaces" },
      { id: "catalog",          label: "Catalog",          icon: CatalogIcon,  href: "/catalog" },
      { id: "usage",            label: "Usage",            icon: ChartLineIcon },
      { id: "user-management",  label: "User management",  icon: UserGroupIcon },
      { id: "security",         label: "Security",         icon: ShieldCheckIcon },
      { id: "cloud-resources",  label: "Cloud resources",  icon: CloudIcon },
      { id: "previews",         label: "Previews",         icon: GiftIcon,  href: "/previews" },
      { id: "settings",         label: "Settings",         icon: GearIcon,  href: "/settings" },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  open?: boolean
  activeItem?: string
  onNavigate?: (id: string) => void
  className?: string
}

export function Sidebar({
  open = true,
  activeItem = "workspace",
  onNavigate,
  className,
}: SidebarProps) {
  // Labelled sections are collapsible; start all expanded
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const toggleSection = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-secondary transition-all duration-200 overflow-hidden",
        open ? "w-[220px]" : "w-0",
        className
      )}
    >
      {/* Nav — scrollable */}
      <nav
        className={cn(
          "flex flex-1 flex-col gap-3 overflow-y-auto px-2 pb-2",
          // Thin, styled scrollbar
          "[&::-webkit-scrollbar]:w-[5px]",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40",
        )}
      >

        {NAV_SECTIONS.map((section, i) => {
          const isSectionCollapsed = section.label ? !!collapsed[section.label] : false

          return (
            <div key={i} className="flex flex-col gap-0.5">
              {/* Collapsible section header */}
              {section.label && open && (
                <button
                  onClick={() => toggleSection(section.label!)}
                  className="group flex h-7 w-full items-center rounded px-2 text-left transition-colors hover:bg-muted-foreground/10"
                >
                  <span className="text-xs font-normal text-muted-foreground">
                    {section.label}
                  </span>
                  <ChevronRight
                    className={cn(
                      "ml-1 h-3 w-3 shrink-0 text-muted-foreground transition-all duration-150",
                      // Collapsed: always visible, pointing right
                      // Expanded: hidden by default, visible on hover (pointing down)
                      isSectionCollapsed
                        ? "opacity-100"
                        : "rotate-90 opacity-0 group-hover:opacity-100"
                    )}
                  />
                </button>
              )}

              {/* Items — hidden when section is collapsed */}
              {!isSectionCollapsed && section.items.map((item) => (
                <NavItemButton
                  key={item.id}
                  item={item}
                  active={activeItem === item.id}
                  sidebarCollapsed={!open}
                  onClick={() => onNavigate?.(item.id)}
                />
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

// ─── Nav item button ──────────────────────────────────────────────────────────

function NavItemButton({
  item,
  active,
  sidebarCollapsed,
  onClick,
}: {
  item: NavItem
  active: boolean
  sidebarCollapsed: boolean
  onClick: () => void
}) {
  const className = cn(
    "flex h-7 w-full items-center gap-2 rounded px-3 text-left text-sm transition-colors",
    active
      ? "bg-primary/10 text-primary font-semibold"
      : "text-foreground hover:bg-muted-foreground/10",
    sidebarCollapsed && "justify-center px-0"
  )

  const content = (
    <>
      <span className="shrink-0">
        <DbIcon
          icon={item.icon}
          size={16}
          color={active ? "primary" : item.iconColor ?? "muted"}
        />
      </span>
      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
    </>
  )

  if (item.href) {
    return (
      <Link href={item.href} title={sidebarCollapsed ? item.label : undefined} className={className} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} title={sidebarCollapsed ? item.label : undefined} className={className}>
      {content}
    </button>
  )
}
