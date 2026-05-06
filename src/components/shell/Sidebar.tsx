"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Pin, Search } from "lucide-react"
import { DbIcon } from "@/components/ui/db-icon"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NAV_VERSIONS, NAV_VERSION_KEYS, type NavItem, type NavVersionKey } from "./navConfigs"

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  open?: boolean
  activeItem?: string
  onNavigate?: (id: string) => void
  defaultNavVersion?: NavVersionKey
  onLayoutChange?: (layout: "sections" | "rail") => void
  className?: string
}

export function Sidebar({
  open = true,
  activeItem = "workspace",
  onNavigate,
  defaultNavVersion,
  onLayoutChange,
  className,
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [navVersion, setNavVersion] = React.useState<NavVersionKey>(
    defaultNavVersion ?? NAV_VERSION_KEYS[0]
  )
  const [activeSection, setActiveSection] = React.useState(0)
  const [drillSection, setDrillSection] = React.useState<number | null>(null)
  const [pinnedIds, setPinnedIds] = React.useState<Set<string>>(new Set())

  const { layout = "sections", sections, maxItemsPerSection } = NAV_VERSIONS[navVersion]

  // Reset state and notify parent when version/layout changes
  React.useEffect(() => {
    setActiveSection(0)
    setDrillSection(null)
    setPinnedIds(new Set())
    setExpanded({})
    onLayoutChange?.(layout === "rail" ? "rail" : "sections")
  }, [navVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePin = (id: string) =>
    setPinnedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // All pinned items in order (across all sections)
  const pinnedItems = sections.flatMap((s) => s.items).filter((item) => pinnedIds.has(item.id))

  const toggleSection = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-secondary transition-all duration-200 overflow-hidden",
        open ? (layout === "rail" ? "w-[280px]" : "w-[220px]") : "w-0",
        className
      )}
    >
      {layout === "drill-down" ? (
        /* ── Drill-down layout (D) ──────────────────────────────────────── */
        <>
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search box */}
            <div className="shrink-0 px-3 pt-3 pb-2">
              <div className="flex h-8 items-center gap-2 rounded border border-border bg-background px-2.5 text-muted-foreground">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="text-sm">Find...</span>
              </div>
            </div>

            {/* Sliding panels — both rendered, translated in/out */}
            <div className="relative flex flex-1 overflow-hidden">
              {/* Level 1 — pinned items + section list */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col overflow-y-auto px-2 pb-2 transition-transform duration-200 ease-in-out",
                  drillSection !== null ? "-translate-x-full" : "translate-x-0"
                )}
              >
                {/* Section list */}
                {sections.map((section, i) => (
                  <button
                    key={i}
                    onClick={() => setDrillSection(i)}
                    className="group flex h-8 w-full items-center gap-2.5 rounded px-2 text-left text-sm text-foreground transition-colors hover:bg-muted-foreground/10"
                  >
                    {section.icon && (
                      <DbIcon icon={section.icon} size={16} color="muted" />
                    )}
                    <span className="flex-1">{section.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}

                {/* Pinned items */}
                {pinnedItems.length > 0 && (
                  <div className="mt-2 flex flex-col gap-0.5">
                    <div className="flex h-6 items-center px-2">
                      <span className="text-xs text-muted-foreground">Pinned</span>
                    </div>
                    {pinnedItems.map((item) => (
                      <NavItemButton
                        key={item.id}
                        item={item}
                        active={activeItem === item.id}
                        sidebarCollapsed={false}
                        compact
                        onClick={() => onNavigate?.(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Level 2 — items with back breadcrumb + pin buttons */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col overflow-hidden transition-transform duration-200 ease-in-out",
                  drillSection !== null ? "translate-x-0" : "translate-x-full"
                )}
              >
                {/* Back breadcrumb */}
                <button
                  onClick={() => setDrillSection(null)}
                  className="flex h-8 shrink-0 items-center gap-1 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{sections[drillSection ?? 0]?.label}</span>
                </button>

                {/* Section items with pin buttons */}
                <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-2">
                  {sections[drillSection ?? 0]?.items.map((item) => {
                    const pinned = pinnedIds.has(item.id)
                    return (
                      <div key={item.id} className="group relative flex w-full items-center">
                        <NavItemButton
                          item={item}
                          active={activeItem === item.id}
                          sidebarCollapsed={false}
                          compact
                          onClick={() => onNavigate?.(item.id)}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePin(item.id) }}
                          title={pinned ? "Unpin" : "Pin"}
                          className={cn(
                            "absolute right-1 flex h-5 w-5 items-center justify-center rounded transition-all",
                            pinned
                              ? "text-primary opacity-100"
                              : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
                          )}
                        >
                          <Pin className={cn("h-3 w-3", pinned && "fill-current")} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Version switcher footer */}
          {open && (
            <footer className="flex shrink-0 items-center gap-1 px-3 py-2 opacity-40 transition-opacity hover:opacity-100">
              {NAV_VERSION_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setNavVersion(key)}
                  className={cn(
                    "flex h-5 items-center rounded px-2 text-xs transition-colors",
                    navVersion === key
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {key}
                </button>
              ))}
            </footer>
          )}
        </>
      ) : layout === "rail" ? (
        /* ── Rail layout ───────────────────────────────────────────────── */
        <div className="flex flex-1 overflow-hidden">
          {/* Rail column — 80px icon strip, with footer pinned at bottom */}
          <div className="flex w-[80px] shrink-0 flex-col">
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
              {sections.map((section, i) => (
                <button
                  key={i}
                  title={section.label}
                  onClick={() => setActiveSection(i)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded px-1 py-1.5 transition-colors",
                    activeSection === i
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted-foreground/10"
                  )}
                >
                  {section.icon && (
                    <DbIcon
                      icon={section.icon}
                      size={20}
                      color={activeSection === i ? "primary" : "muted"}
                    />
                  )}
                  {section.label && (
                    <span className="w-full truncate text-center text-[11px] leading-tight">
                      {section.label}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Version switcher inside rail column */}
            {open && (
              <footer className="flex shrink-0 flex-col items-center gap-1 px-2 py-2 opacity-40 transition-opacity hover:opacity-100">
                {NAV_VERSION_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setNavVersion(key)}
                    className={cn(
                      "flex h-5 w-full items-center justify-center rounded px-1 text-xs transition-colors",
                      navVersion === key
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {key}
                  </button>
                ))}
              </footer>
            )}
          </div>

          {/* Panel column — visually merges with <main> */}
          <div
            className={cn(
              "flex flex-1 flex-col overflow-y-auto px-1 py-2",
              "bg-background border border-r border-border rounded-tl-md rounded-bl-md mb-2",
              "[&::-webkit-scrollbar]:w-[5px]",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:bg-border",
              "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40",
            )}
          >
            {sections[activeSection]?.items.map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                active={activeItem === item.id}
                sidebarCollapsed={false}
                onClick={() => onNavigate?.(item.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ── Sections layout (A / B) ────────────────────────────────────── */
        <>
          <nav
            className={cn(
              "flex flex-1 flex-col gap-3 overflow-y-auto px-2 pb-2",
              "[&::-webkit-scrollbar]:w-[5px]",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:bg-border",
              "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40",
            )}
          >
            {sections.map((section, i) => {
              const isSectionCollapsed = section.label ? !!collapsed[section.label] : false
              const isSectionExpanded = section.label ? !!expanded[section.label] : true
              const limit = maxItemsPerSection
              const visibleItems = (!isSectionCollapsed && limit && !isSectionExpanded)
                ? section.items.slice(0, limit)
                : section.items
              const hiddenCount = limit ? Math.max(0, section.items.length - limit) : 0

              return (
                <div key={i} className="flex flex-col gap-0.5">
                  {section.label && open && (
                    <button
                      onClick={() => toggleSection(section.label!)}
                      className="group flex h-7 w-full items-center gap-1 rounded px-2 text-left transition-colors hover:bg-muted-foreground/10"
                    >
                      <span className="text-xs font-normal text-muted-foreground">
                        {section.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 shrink-0 text-muted-foreground transition-all duration-150 opacity-0 group-hover:opacity-100",
                          isSectionCollapsed ? "-rotate-90" : "rotate-0"
                        )}
                      />
                    </button>
                  )}

                  {!isSectionCollapsed && visibleItems.map((item) => (
                    <NavItemButton
                      key={item.id}
                      item={item}
                      active={activeItem === item.id}
                      sidebarCollapsed={!open}
                      compact
                      onClick={() => onNavigate?.(item.id)}
                    />
                  ))}

                  {!isSectionCollapsed && hiddenCount > 0 && (
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [section.label!]: !prev[section.label!] }))}
                      className="flex h-7 items-center gap-1.5 rounded px-3 text-xs text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
                    >
                      {isSectionExpanded ? (
                        <>
                          <ChevronDown className="h-3 w-3 rotate-180" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          {hiddenCount} more
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Version switcher — fixed footer */}
          {open && (
            <footer className="flex shrink-0 items-center gap-1 px-3 py-2 opacity-40 transition-opacity hover:opacity-100">
              {NAV_VERSION_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setNavVersion(key)}
                  className={cn(
                    "flex h-5 items-center rounded px-2 text-xs transition-colors",
                    navVersion === key
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {key}
                </button>
              ))}
            </footer>
          )}
        </>
      )}
    </aside>
  )
}

// ─── Nav item button ──────────────────────────────────────────────────────────

function NavItemButton({
  item,
  active,
  sidebarCollapsed,
  compact,
  onClick,
}: {
  item: NavItem
  active: boolean
  sidebarCollapsed: boolean
  compact?: boolean
  onClick: () => void
}) {
  const className = cn(
    "flex w-full items-center gap-2 rounded px-3 text-left text-sm transition-colors",
    compact ? "h-7" : "h-8",
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
