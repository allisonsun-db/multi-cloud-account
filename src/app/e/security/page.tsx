"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell } from "@/components/shell"
import { Card, CardContent } from "@/components/ui/card"
import { Donut } from "@/components/monitoring/charts"
import { SegmentBar, type Segment } from "@/components/home/CardVisual"
import { DbIcon } from "@/components/ui/db-icon"
import { TableIcon, ChevronRightIcon } from "@/components/icons"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { varyPercent } from "@/lib/scope-data"
import { Info, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Security is a monitoring-only lens — posture and findings across the account. The
// overview donut (findings passed by severity) sits beside a "workspaces that need
// attention" list; below, four control-category cards each show a passed/severity
// breakdown bar. Mock data only.

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
  { label: "Medium risk findings", value: 11, color: "var(--warning)" },
  { label: "High risk findings", value: 5, color: "var(--trend-negative)" },
  { label: "Low risk findings", value: 5, color: "var(--color-lemon-500)" },
]

// Severity rows shown in the donut legend (matches the reference order/colors).
const SEVERITY_LEGEND = [
  { label: "High risk findings", pct: "5%", color: "var(--trend-negative)" },
  { label: "Medium risk findings", pct: "11%", color: "var(--warning)" },
  { label: "Low risk findings", pct: "5%", color: "var(--color-lemon-500)" },
]

const ATTENTION_WORKSPACES = [
  { name: "dev-notebooks", findings: 6 },
  { name: "dev-experimentation", findings: 5 },
  { name: "staging-etl", findings: 3 },
  { name: "prod-analytics", findings: 2 },
  { name: "prod-ml-serving", findings: 2 },
  { name: "dev-sandbox", findings: 2 },
]

type Category = {
  title: string
  passed: number
  delta: string
  deltaTone: "success" | "danger"
  segments: Segment[]
  cta: string
}

const CATEGORIES: Category[] = [
  {
    title: "Data protection",
    passed: 65,
    delta: "1.4%",
    deltaTone: "danger",
    segments: [{ kind: "passed", value: 65 }, { kind: "high", value: 5 }, { kind: "medium", value: 12 }, { kind: "low", value: 18 }],
    cta: "View data protection controls",
  },
  {
    title: "Identity & access",
    passed: 78,
    delta: "+7.8%",
    deltaTone: "success",
    segments: [{ kind: "passed", value: 78 }, { kind: "high", value: 8 }, { kind: "medium", value: 11 }, { kind: "low", value: 3 }],
    cta: "View identity & access controls",
  },
  {
    title: "Network security",
    passed: 69,
    delta: "+2.1%",
    deltaTone: "success",
    segments: [{ kind: "passed", value: 69 }, { kind: "high", value: 4 }, { kind: "medium", value: 15 }, { kind: "low", value: 12 }],
    cta: "View network security controls",
  },
  {
    title: "Platform hygiene",
    passed: 83,
    delta: "+3.2%",
    deltaTone: "success",
    segments: [{ kind: "passed", value: 83 }, { kind: "high", value: 5 }, { kind: "medium", value: 8 }, { kind: "low", value: 4 }],
    cta: "View platform hygiene controls",
  },
]

// ─── Reusable pieces ─────────────────────────────────────────────────────────────

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-foreground">{children}</span>
      <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </div>
  )
}

function CardFooterLink({ label, href }: { label: string; href?: string }) {
  const className = "flex h-8 w-full items-center justify-center gap-1 rounded border border-border text-sm text-foreground transition-colors hover:bg-muted"
  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </Link>
    )
  }
  return (
    <button type="button" className={className}>
      {label}
      <ChevronRightIcon className="h-3.5 w-3.5" />
    </button>
  )
}

function PlaceholderPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-1 p-12 text-center">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{detail}</div>
      </CardContent>
    </Card>
  )
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle>{category.title}</CardTitle>
          <div className="text-[18px] leading-6 font-semibold text-foreground">{category.passed}% passed</div>
          <div className="text-sm text-muted-foreground">
            <span className={category.deltaTone === "success" ? "text-[var(--success)]" : "text-destructive"}>
              {category.delta}
            </span>{" "}
            vs. 30 days ago
          </div>
        </div>
        <SegmentBar segments={category.segments} />
        <CardFooterLink label={category.cta} />
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UnifiedSecurityPage() {
  // Prototype-only: the picker scopes the (mock) dashboard. "all" = across all workspaces.
  const [workspace, setWorkspace] = React.useState("all")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const selectedWorkspace = workspace === "all" ? undefined : WORKSPACES.find((w) => w.id === workspace)
  const selectedLabel = selectedWorkspace?.name ?? "All workspaces"

  // Reshape the findings donut + category cards for the selected workspace (stable per id).
  const passedPct = varyPercent(75, workspace, 15)
  const findingsSlices = React.useMemo(() => {
    if (workspace === "all") return FINDINGS_SLICES
    const remainder = 100 - passedPct
    return [
      { label: "Passed", value: passedPct, color: "var(--trend-positive)" },
      { label: "Medium risk findings", value: +(remainder * 0.5).toFixed(1), color: "var(--warning)" },
      { label: "High risk findings", value: +(remainder * 0.25).toFixed(1), color: "var(--trend-negative)" },
      { label: "Low risk findings", value: +(remainder * 0.25).toFixed(1), color: "var(--color-lemon-500)" },
    ]
  }, [workspace, passedPct])
  const severityLegend = React.useMemo(
    () => (workspace === "all"
      ? SEVERITY_LEGEND
      : [
          { label: "High risk findings", color: "var(--trend-negative)", pct: `${findingsSlices[2].value}%` },
          { label: "Medium risk findings", color: "var(--warning)", pct: `${findingsSlices[1].value}%` },
          { label: "Low risk findings", color: "var(--color-lemon-500)", pct: `${findingsSlices[3].value}%` },
        ]),
    [workspace, findingsSlices],
  )
  const categories = React.useMemo(
    () => (workspace === "all"
      ? CATEGORIES
      : CATEGORIES.map((c) => {
          const passed = varyPercent(c.passed, workspace, 14, c.title)
          const rem = 100 - passed
          return {
            ...c,
            passed,
            segments: [
              { kind: "passed" as const, value: passed },
              { kind: "high" as const, value: +(rem * 0.3).toFixed(1) },
              { kind: "medium" as const, value: +(rem * 0.45).toFixed(1) },
              { kind: "low" as const, value: +(rem * 0.25).toFixed(1) },
            ],
          }
        })),
    [workspace],
  )

  return (
    <AppShell activeItem="security">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        <h1 className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
          <button
            type="button"
            onClick={() => setWorkspace("all")}
            className="rounded px-1 py-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Security
          </button>
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

        <Tabs defaultValue="overview" className="gap-4">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            <TabsTrigger value="overview" className="flex-none">Overview</TabsTrigger>
            <TabsTrigger value="networking" className="flex-none">Networking</TabsTrigger>
            <TabsTrigger value="token-report" className="flex-none">Token report</TabsTrigger>
            <TabsTrigger value="encryption-keys" className="flex-none">Encryption keys</TabsTrigger>
            <TabsTrigger value="esc-add-on" className="flex-none">ESC add-on</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-4">
        {/* Top row: findings donut · workspaces needing attention */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Security findings */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Security findings</CardTitle>
                <div className="flex items-center gap-2 text-[18px] leading-6 font-semibold text-foreground">
                  <span className="size-3 shrink-0 rounded-[2px] bg-[var(--trend-positive)]" aria-hidden="true" />
                  {passedPct}% findings passed
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="text-[var(--success)]">+4.3</span> vs. 30 days ago
                </div>
              </div>

              {/* Donut + severity legend */}
              <div className="flex items-center gap-6">
                <Donut slices={findingsSlices} size={140} thickness={22} hideLegend />
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <span className="text-xs text-muted-foreground">Severity</span>
                  {severityLegend.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      className="flex items-center justify-between gap-3 text-left text-sm transition-colors hover:text-primary"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: s.color }} />
                        <span className="min-w-0 text-foreground">{s.label}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 font-semibold text-foreground">
                        {s.pct}
                        <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <CardFooterLink label="View all controls" href="/e/security/controls" />
            </CardContent>
          </Card>

          {/* Workspaces that need attention */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-4 p-4">
              <CardTitle>Workspaces that need attention</CardTitle>
              <div className="flex flex-1 flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Workspace</span>
                  <span># of high risk findings</span>
                </div>
                {ATTENTION_WORKSPACES.map((w) => (
                  <button
                    key={w.name}
                    type="button"
                    className="group flex items-center justify-between gap-3 rounded text-left"
                  >
                    <span className="flex min-w-0 items-center gap-2 rounded bg-[var(--background-danger)] px-2 py-1">
                      <DbIcon icon={TableIcon} size={16} className="shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm text-foreground">{w.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
                      {w.findings}
                      <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((c) => (
            <CategoryCard key={c.title} category={c} />
          ))}
        </div>
          </TabsContent>

          <TabsContent value="networking"><PlaceholderPanel title="Networking" detail="Network access, private connectivity, and firewall controls." /></TabsContent>
          <TabsContent value="token-report"><PlaceholderPanel title="Token report" detail="Personal access tokens and service principal credentials across the account." /></TabsContent>
          <TabsContent value="encryption-keys"><PlaceholderPanel title="Encryption keys" detail="Customer-managed keys and encryption configuration." /></TabsContent>
          <TabsContent value="esc-add-on"><PlaceholderPanel title="ESC add-on" detail="Enhanced Security & Compliance add-on settings." /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
