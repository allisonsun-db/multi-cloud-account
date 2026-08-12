"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell } from "@/components/shell"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Donut } from "@/components/monitoring/charts"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { scaleValue } from "@/lib/scope-data"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, SlidersHorizontal, LayoutGrid, Workflow, ChevronDown, Filter, Info, TriangleAlert, CircleCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Control explorer — the drill-down from the Security overview's "View all controls".
// A filter toolbar over a findings-summary card (donut + severity counts) and a table
// of every scanned control with its category, tier, severity, and pass/fail spread.
// Mock data only.

// ─── Mock data ─────────────────────────────────────────────────────────────────

// Workspaces the view can scope to (subset of the account's workspaces).
const WORKSPACES: { id: string; name: string; cloud: "AWS" | "Azure" | "GCP" }[] = [
  { id: "1", name: "prod-us-west", cloud: "AWS" },
  { id: "5", name: "data-eng-prod", cloud: "Azure" },
  { id: "6", name: "ml-platform-prod", cloud: "GCP" },
  { id: "7", name: "analytics-prod", cloud: "AWS" },
  { id: "11", name: "marketing-analytics", cloud: "Azure" },
  { id: "20", name: "model-serving-prod", cloud: "AWS" },
]

const FINDINGS_SLICES = [
  { label: "Passed", value: 79, color: "var(--trend-positive)" },
  { label: "Medium risk", value: 11, color: "var(--warning)" },
  { label: "High risk", value: 5, color: "var(--trend-negative)" },
  { label: "Low risk", value: 5, color: "var(--color-lemon-500)" },
]

const SEVERITY_STATS = [
  { label: "High risk findings", value: "25", delta: "−3", color: "var(--trend-negative)" },
  { label: "Medium risk findings", value: "61", delta: "−6", color: "var(--warning)" },
  { label: "Low risk findings", value: "28", delta: "−1", color: "var(--color-lemon-500)" },
]

type Severity = "High risk" | "Medium risk" | "Low risk"

type Control = {
  id: string
  title: string
  category: string
  subcategory: string
  tier: string
  severity: Severity
  failed: number
  passed: number
}

const CONTROLS: Control[] = [
  { id: "DP-02",  title: "Workspace is assigned to a metastore",                      category: "Data protection",   subcategory: "UC readiness",         tier: "ALL", severity: "High risk", failed: 3, passed: 7 },
  { id: "IAM-09", title: "Single sign-on (SSO) is enabled for the account and workspaces", category: "Identity & access", subcategory: "Authentication",   tier: "ALL", severity: "High risk", failed: 3, passed: 7 },
  { id: "IAM-17", title: "UC metastore admin is only granted to non-account admins",  category: "Identity & access", subcategory: "Identity governance",  tier: "ALL", severity: "High risk", failed: 3, passed: 7 },
  { id: "HYG-01", title: "Legacy features are disabled for new workspaces",           category: "Platform hygiene",  subcategory: "Platform baseline",    tier: "ALL", severity: "High risk", failed: 2, passed: 8 },
  { id: "HYG-11", title: "Compliance Security Profile is automatically applied",       category: "Platform hygiene",  subcategory: "Platform baseline",    tier: "ESC", severity: "High risk", failed: 2, passed: 8 },
  { id: "IAM-06", title: "OpenSharing recipient token maximum lifetime is met",        category: "Identity & access", subcategory: "Authentication",       tier: "ALL", severity: "High risk", failed: 2, passed: 8 },
  { id: "IAM-11", title: "Users and groups are synchronized with your identity provider", category: "Identity & access", subcategory: "Identity governance", tier: "ALL", severity: "High risk", failed: 2, passed: 8 },
  { id: "NET-03", title: "Private connectivity is enabled between workspaces and control plane", category: "Network security", subcategory: "Connectivity", tier: "ALL", severity: "Medium risk", failed: 2, passed: 8 },
  { id: "DP-07",  title: "Customer-managed keys are configured for managed services", category: "Data protection",   subcategory: "Encryption",           tier: "ESC", severity: "Medium risk", failed: 1, passed: 9 },
  { id: "NET-08", title: "IP access lists restrict workspace access",                  category: "Network security",  subcategory: "Perimeter",            tier: "ALL", severity: "Low risk", failed: 1, passed: 9 },
]

const CATEGORY_OPTIONS = ["Data protection", "Identity & access", "Network security", "Platform hygiene"]

const SEVERITY_DOT: Record<Severity, string> = {
  "High risk":   "var(--trend-negative)",
  "Medium risk": "var(--warning)",
  "Low risk":    "var(--color-lemon-500)",
}

// ─── Toolbar dropdown ────────────────────────────────────────────────────────────

function FilterDropdown({
  icon: Icon,
  label,
  options,
  selected,
  onToggle,
  width = "w-[220px]",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
  width?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
          <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={width}>
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o}
            checked={selected.has(o)}
            onCheckedChange={() => onToggle(o)}
            onSelect={(e) => e.preventDefault()}
          >
            {o}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ControlExplorerPage() {
  const [query, setQuery] = React.useState("")
  const [categories, setCategories] = React.useState<Set<string>>(new Set())

  // Prototype-only: the picker scopes the (mock) view. "all" = across all workspaces.
  const [workspace, setWorkspace] = React.useState("all")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const selectedWorkspace = workspace === "all" ? undefined : WORKSPACES.find((w) => w.id === workspace)
  const selectedLabel = selectedWorkspace?.name ?? "All workspaces"

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>) => (value: string) =>
    set((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })

  // Reshape the findings summary (donut + severity counts) for the selected workspace.
  const severityStats = React.useMemo(
    () => (workspace === "all"
      ? SEVERITY_STATS
      : SEVERITY_STATS.map((s) => ({ ...s, value: `${Math.max(0, Math.round(scaleValue(Number(s.value), workspace)))}` }))),
    [workspace],
  )
  const findingsSlices = React.useMemo(() => {
    if (workspace === "all") return FINDINGS_SLICES
    const high = Number(severityStats[0].value)
    const medium = Number(severityStats[1].value)
    const low = Number(severityStats[2].value)
    const total = high + medium + low
    const passed = Math.max(0, Math.round(total * 3.6)) // keep the ring mostly-passed
    return [
      { label: "Passed", value: passed, color: "var(--trend-positive)" },
      { label: "Medium risk", value: medium, color: "var(--warning)" },
      { label: "High risk", value: high, color: "var(--trend-negative)" },
      { label: "Low risk", value: low, color: "var(--color-lemon-500)" },
    ]
  }, [workspace, severityStats])
  const controlCount = workspace === "all" ? 51 : Math.max(1, Math.round(scaleValue(51, workspace)))

  const rows = CONTROLS.filter((c) => {
    const matchesQuery =
      c.title.toLowerCase().includes(query.toLowerCase()) || c.id.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = categories.size === 0 || categories.has(c.category)
    return matchesQuery && matchesCategory
  })

  return (
    <AppShell activeItem="security">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        <h1 className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
          <Link
            href="/e/security"
            className="rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Security
          </Link>
          <span className="text-border font-normal" aria-hidden="true">/</span>
          <span className="truncate">Control explorer</span>
          <span className="text-border font-normal" aria-hidden="true">/</span>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Select workspace scope"
                className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[22px] leading-7 font-semibold text-foreground transition-colors hover:bg-muted data-[state=open]:bg-muted"
              >
                {selectedWorkspace && (
                  <img
                    src={CLOUD_LOGO[selectedWorkspace.cloud]}
                    alt=""
                    width={18}
                    height={18}
                    className={cn("size-[18px] shrink-0 object-contain", selectedWorkspace.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                  />
                )}
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown className="size-5 shrink-0 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[260px] p-0">
              <Command>
                <CommandInput placeholder="Search workspaces…" />
                <CommandList>
                  <CommandEmpty>No workspaces found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="All workspaces"
                      onSelect={() => { setWorkspace("all"); setPickerOpen(false) }}
                    >
                      <Check className={cn("h-4 w-4", workspace === "all" ? "opacity-100" : "opacity-0")} />
                      All workspaces
                    </CommandItem>
                    {WORKSPACES.map((w) => (
                      <CommandItem
                        key={w.id}
                        value={w.name}
                        onSelect={() => { setWorkspace(w.id); setPickerOpen(false) }}
                      >
                        <Check className={cn("h-4 w-4", workspace === w.id ? "opacity-100" : "opacity-0")} />
                        <img
                          src={CLOUD_LOGO[w.cloud]}
                          alt=""
                          width={14}
                          height={14}
                          className={cn("h-3.5 w-3.5 shrink-0 object-contain", w.cloud === "AWS" && "dark:[filter:brightness(0)_invert(1)]")}
                        />
                        <span className="truncate">{w.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </h1>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-[280px] max-w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search controls…"
              className="h-9 pl-8"
            />
          </div>
          <FilterDropdown icon={SlidersHorizontal} label="Filters" options={["High risk", "Medium risk", "Low risk", "Failing only"]} selected={new Set()} onToggle={() => {}} />
          <FilterDropdown icon={LayoutGrid} label="Categories" options={CATEGORY_OPTIONS} selected={categories} onToggle={toggle(setCategories)} />
          <FilterDropdown icon={Workflow} label="All workspaces" options={["prod-us-west", "data-eng-prod", "ml-platform-prod", "analytics-prod"]} selected={new Set()} onToggle={() => {}} width="w-[240px]" />
        </div>

        {/* Findings summary */}
        <Card className="py-0 shadow-none">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">Security findings</span>
                <span className="text-sm text-muted-foreground">{controlCount} controls scanned across workspaces in your account.</span>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">Last scan: August 11, 2026 at 8:00 AM PDT</span>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <Donut slices={findingsSlices} size={132} thickness={22} hideLegend />
              <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3">
                {severityStats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      {s.label}
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                    <span className="flex items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
                      <span className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: s.color }} />
                      {s.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <span className="text-[var(--success)]">{s.delta}</span> vs. 30 days ago
                    </span>
                    <button type="button" className="mt-1 flex items-center gap-1.5 text-sm text-primary">
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-foreground">Control details</TableHead>
              <TableHead className="font-semibold text-foreground">Category</TableHead>
              <TableHead className="font-semibold text-foreground">Tier</TableHead>
              <TableHead className="font-semibold text-foreground">Severity</TableHead>
              <TableHead className="font-semibold text-foreground">Findings failed</TableHead>
              <TableHead className="font-semibold text-foreground">Findings passed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No controls found.</TableCell>
              </TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{c.id}</span>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm text-foreground">{c.title}</span>
                      <span className="text-xs text-muted-foreground">Last scan: All workspaces | Next scan: All workspaces</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{c.category}</span>
                    <span className="text-xs text-muted-foreground">{c.subcategory}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.tier}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: SEVERITY_DOT[c.severity] }} />
                    {c.severity}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 rounded bg-[var(--background-danger)] px-2 py-1 text-sm text-foreground">
                    <TriangleAlert className="h-3.5 w-3.5 text-destructive" />
                    {c.failed} workspaces
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 rounded bg-[var(--background-success)] px-2 py-1 text-sm text-foreground">
                    <CircleCheck className="h-3.5 w-3.5 text-[var(--success)]" />
                    {c.passed} workspaces
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  )
}
