"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Pin, Search } from "lucide-react"
import { DbIcon } from "@/components/ui/db-icon"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PinCancelIcon } from "@/components/icons"
import { DEFAULT_NAV_VERSION, NAV_VERSIONS, type NavItem, type NavVersionKey } from "./navConfigs"
import { AccountOrgSwitcher } from "./AccountOrgSwitcher"
import { useAccountScope } from "./AppShell"
import { usePersona } from "@/components/home/usePersona"
import type { PersonaKey } from "@/components/home/personaConfigs"

// ─── Component ────────────────────────────────────────────────────────────────

const ROLE_NAV_ITEMS: Partial<Record<PersonaKey, Set<string>>> = {
  "workspace-admin": new Set([
    "workspaces",
    "performance",
    "previews",
    "feature-preview",
  ]),
  "finops-admin": new Set([
    "cost",
    "tags",
    "billing",
    "ai",
    "ai-gov",
    "ai-gateway",
    "genie",
  ]),
  "security-admin": new Set([
    "security",
    "security-gov",
    "security-cloud",
    "cloud-resources",
    "resilience",
  ]),
  "identity-admin": new Set([
    "user-management",
    "identities",
    "identity-provider",
  ]),
}

function canShowNavItemForPersona(item: NavItem, persona: PersonaKey) {
  // Account Admin and Read-only Admin both receive broad navigation. Read-only
  // behavior is represented by the persona's page content, not by hiding pages.
  const allowedItems = ROLE_NAV_ITEMS[persona]
  if (!allowedItems) return true
  return allowedItems.has(item.id)
}

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
    defaultNavVersion ?? DEFAULT_NAV_VERSION
  )
  const hasHydrated = React.useRef(false)
  React.useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true
    const stored = sessionStorage.getItem("proto-nav-version")
    if (stored && stored in NAV_VERSIONS) setNavVersion(stored as NavVersionKey)
  }, [])
  const [activeSection, setActiveSection] = React.useState(0)
  const [drillSection, setDrillSection] = React.useState<number | null>(null)
  // Section whose flyout is open.
  const [hoveredSection, setHoveredSection] = React.useState<number | null>(null)
  // While a level-1↔level-2 slide is animating, ignore hover so the panel sliding
  // under a stationary cursor can't flash a flyout open. As the row slides beneath
  // the pointer the browser fires mouseleave/enter + tiny jitter moves that look
  // like real hover; we gate on the animation (a known duration we control here)
  // instead of trying to distinguish those events. Cleared when the slide ends.
  const [sliding, setSliding] = React.useState(false)
  const slideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const beginSlide = React.useCallback(() => {
    setHoveredSection(null)
    setSliding(true)
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
    // Matches the panel transition duration below (duration-300) + a small buffer.
    slideTimerRef.current = setTimeout(() => setSliding(false), 340)
  }, [])

  React.useEffect(() => () => {
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
  }, [])

  const handleSectionPointerMove = (i: number) => {
    if (sliding) return
    setHoveredSection(i)
  }

  const handleSectionPointerLeave = (i: number) => {
    setHoveredSection((s) => (s === i ? null : s))
  }
  const [pinnedIds, setPinnedIds] = React.useState<Set<string>>(new Set())
  const [findQuery, setFindQuery] = React.useState("")
  const [selectedItem, setSelectedItem] = React.useState(activeItem)
  const { scope } = useAccountScope()
  const persona = usePersona()

  const { layout = "sections", sections: navSections, maxItemsPerSection } = NAV_VERSIONS[navVersion]
  const sections = React.useMemo(() => {
    const shouldHideAccounts = scope !== "org"
    const shouldHideAccountSettings = scope === "org"

    return navSections
      .map((section) => ({
        ...section,
        // When scoped to the organization, the "Account" section reads "Organization".
        label: section.label === "Account" && scope === "org" ? "Organization" : section.label,
        items: section.items.filter((item) => (
          !(shouldHideAccounts && item.id === "accounts") &&
          !(shouldHideAccountSettings && item.id === "custom-url") &&
          canShowNavItemForPersona(item, persona)
        )),
      }))
      .filter((section) => section.items.length > 0)
  }, [navSections, persona, scope])
  const currentActiveItem = selectedItem || activeItem
  const activeSectionIndex = sections.findIndex((section) =>
    section.items.some((item) => item.id === currentActiveItem)
  )

  React.useEffect(() => {
    setSelectedItem(activeItem)
  }, [activeItem])

  const handleNavigate = (id: string) => {
    setSelectedItem(id)
    onNavigate?.(id)
  }

  // Listen for nav version changes from settings page
  React.useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent).detail as NavVersionKey
      if (key in NAV_VERSIONS) setNavVersion(key)
    }
    window.addEventListener("proto-nav-version-change", handler)
    return () => window.removeEventListener("proto-nav-version-change", handler)
  }, [])

  // Reset state and notify parent when version/layout changes
  React.useEffect(() => {
    setActiveSection(0)
    setDrillSection(null)
    setHoveredSection(null)
    setPinnedIds(new Set())
    setExpanded({})
    setFindQuery("")
    onLayoutChange?.(layout === "rail" ? "rail" : "sections")
  }, [navVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    setActiveSection(0)
    setDrillSection(null)
    setHoveredSection(null)
    setPinnedIds(new Set())
    setFindQuery("")
  }, [persona, scope])

  const togglePin = (id: string) =>
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

  // All pinned items in order (across all sections)
  const pinnedItems = sections.flatMap((s) => s.items).filter((item) => pinnedIds.has(item.id))

  const toggleSection = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-secondary transition-all duration-200",
        open ? (layout === "rail" ? "w-[276px] overflow-visible" : "w-[220px] overflow-visible") : "w-0 overflow-hidden",
        className
      )}
    >
      {open && layout !== "rail" && (
        <AccountOrgSwitcher className={layout === "drill-down" ? "pb-[6px]" : undefined} />
      )}

      {layout === "drill-down" ? (
        /* ── Drill-down layout (D) ──────────────────────────────────────── */
        <>
          <div className="flex flex-1 flex-col overflow-visible">
            {/* Search box */}
            <div className="shrink-0 px-2 pb-2">
              <div className="flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <input
                  value={findQuery}
                  onChange={(e) => { setFindQuery(e.target.value); setDrillSection(null) }}
                  placeholder="Find..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {findQuery && (
                  <button onClick={() => setFindQuery("")} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <ChevronDown className="h-3 w-3 rotate-90" />
                  </button>
                )}
              </div>
            </div>

            {/* Search results */}
            {findQuery.trim() && (
              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
                {sections.flatMap((section, sectionIndex) =>
                  section.items.filter((item) =>
                    item.label.toLowerCase().includes(findQuery.toLowerCase())
                  ).map((item) => (
                    <NavItemButton
                      key={item.id}
                      item={item}
                      active={currentActiveItem === item.id}
                      sidebarCollapsed={false}
                      onClick={() => {
                        handleNavigate(item.id)
                        setDrillSection(sectionIndex)
                        setFindQuery("")
                      }}
                    />
                  ))
                )}
                {sections.flatMap((s) => s.items).filter((item) =>
                  item.label.toLowerCase().includes(findQuery.toLowerCase())
                ).length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">No results</p>
                )}
              </div>
            )}

            {/* Sliding panels — both rendered, translated in/out */}
            <div className={cn("relative flex flex-1 overflow-visible", findQuery.trim() && "hidden")}>
              {/* Level 1 — pinned items + section list */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col gap-0.5 overflow-visible px-2 pb-2 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  drillSection !== null ? "pointer-events-none -translate-x-full opacity-0" : "translate-x-0 opacity-100"
                )}
              >
                {/* Section list */}
                {sections.map((section, i) => {
                  const active = i === activeSectionIndex
                  // Open the flyout only on real pointer movement — not CSS :hover —
                  // so a panel sliding in under a stationary cursor after "back"
                  // can't flash it open. It opens the moment the pointer moves.
                  const flyoutOpen = drillSection === null && hoveredSection === i

                  return (
                    <div
                      key={i}
                      className="relative"
                      onMouseMove={() => handleSectionPointerMove(i)}
                      onMouseLeave={() => handleSectionPointerLeave(i)}
                    >
                      <button
                        onClick={() => { beginSlide(); setDrillSection(i) }}
                        className={cn(
                          "flex h-[30px] w-full items-center gap-2.5 rounded px-2 text-left text-sm transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : cn("text-foreground", flyoutOpen && "bg-muted-foreground/10")
                        )}
                      >
                        {section.icon && (
                          <DbIcon icon={section.icon} size={16} color={active ? "primary" : "muted"} />
                        )}
                        <span className="flex-1">{section.label}</span>
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-opacity",
                            active ? "text-primary opacity-100" : cn("text-muted-foreground", flyoutOpen ? "opacity-100" : "opacity-0")
                          )}
                        />
                      </button>

                      {flyoutOpen && (
                        <div className="absolute left-full top-0 z-30 ml-1 flex w-[220px] flex-col rounded-md border border-border bg-[var(--popover)] p-1 shadow-[var(--shadow-db-lg)] before:absolute before:-left-1 before:top-0 before:h-full before:w-1 before:content-['']">
                          {section.items.map((item) => {
                            const pinned = pinnedIds.has(item.id)
                            return (
                              <div key={item.id} className="group/item relative flex w-full items-center">
                                <NavItemButton
                                  item={item}
                                  active={currentActiveItem === item.id}
                                  sidebarCollapsed={false}
                                  compact
                                  className="h-[30px]"
                                  onClick={() => handleNavigate(item.id)}
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); togglePin(item.id) }}
                                  title={pinned ? "Unpin" : "Pin"}
                                  className={cn(
                                    "absolute right-1 flex h-5 w-5 items-center justify-center rounded transition-all",
                                    pinned
                                      ? "text-primary opacity-100"
                                      : "text-muted-foreground opacity-0 group-hover/item:opacity-100 hover:text-foreground"
                                  )}
                                >
                                  <Pin className={cn("h-3 w-3", pinned && "fill-current")} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Pinned items */}
                {pinnedItems.length > 0 && (
                  <div className="mt-2 flex flex-col gap-0.5">
                    <div className="flex h-6 items-center px-2">
                      <span className="text-xs text-muted-foreground">Pinned</span>
                    </div>
                    {pinnedItems.map((item) => (
                      <div key={item.id} className="group/pinned relative flex w-full items-center">
                        <NavItemButton
                          item={item}
                          active={currentActiveItem === item.id}
                          sidebarCollapsed={false}
                          compact
                          onClick={() => handleNavigate(item.id)}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePin(item.id) }}
                          title="Unpin"
                          className="absolute right-1 flex h-5 w-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover/pinned:opacity-100"
                        >
                          <PinCancelIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Level 2 — items with back breadcrumb + pin buttons */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col overflow-hidden transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  drillSection !== null ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"
                )}
              >
                {/* Back breadcrumb */}
                <button
                  onClick={() => {
                    // Gate hover for the slide's duration so the level-1 panel
                    // sliding back under the resting cursor can't flash a flyout
                    // open. Reopens normally once the slide ends and the pointer moves.
                    beginSlide()
                    setDrillSection(null)
                  }}
                  className="flex h-8 shrink-0 items-center gap-1 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{sections[drillSection ?? 0]?.label}</span>
                </button>

                {/* Section items with pin buttons */}
                <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
                  {sections[drillSection ?? 0]?.items.map((item) => {
                    const pinned = pinnedIds.has(item.id)
                    return (
                      <div key={item.id} className="group relative flex w-full items-center">
                        <NavItemButton
                          item={item}
                          active={currentActiveItem === item.id}
                          sidebarCollapsed={false}
                          compact
                          onClick={() => handleNavigate(item.id)}
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

        </>
      ) : layout === "rail" ? (
        /* ── Rail layout ───────────────────────────────────────────────── */
        <div className="flex flex-1 overflow-hidden">
          {/* Rail column — 80px icon strip, with footer pinned at bottom */}
          <div className="flex w-[72px] shrink-0 flex-col">
            <AccountOrgSwitcher variant="compact" />
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
                active={currentActiveItem === item.id}
                sidebarCollapsed={false}
                onClick={() => handleNavigate(item.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ── Sections layout (A / B) ────────────────────────────────────── */
        <>
          <nav
            className={cn(
              "flex flex-1 flex-col gap-4 overflow-y-auto px-2 pt-2 pb-2",
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
                      className="group flex h-7 w-full items-center gap-1 rounded px-3 text-left transition-colors hover:bg-muted-foreground/10"
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
                      active={currentActiveItem === item.id}
                      sidebarCollapsed={!open}
                      compact
                      onClick={() => handleNavigate(item.id)}
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
  className: classNameProp,
  onClick,
}: {
  item: NavItem
  active: boolean
  sidebarCollapsed: boolean
  compact?: boolean
  className?: string
  onClick: () => void
}) {
  const className = cn(
    "flex w-full items-center gap-2 rounded px-3 text-left text-sm transition-colors",
    compact ? "h-7" : "h-8",
    active
      ? "bg-primary/10 text-primary font-semibold"
      : "text-foreground hover:bg-muted-foreground/10",
    sidebarCollapsed && "justify-center px-0",
    classNameProp
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
