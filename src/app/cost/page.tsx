"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart } from "@/components/monitoring/charts"
import { scaleSeries, scaleValue } from "@/lib/scope-data"
import { DbIcon } from "@/components/ui/db-icon"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ModelsIcon,
  QueryIcon,
  WorkflowsIcon,
  ChipIcon,
  PipelineIcon,
  ChevronRightIcon,
} from "@/components/icons"
import { Info, ChevronDown, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// Cost monitoring surface — a read-only "how is spend doing across the account"
// dashboard. Three stat cards (30d / MTD / avg daily), a daily-spend bar chart, a
// top-groups ranked list (Products / Workspaces), tagged-spend coverage, and a
// budgets summary. Mock data only.

// ─── Mock data ─────────────────────────────────────────────────────────────────

// Workspaces the cost view can scope to (subset of the account's workspaces).
const COST_WORKSPACES: { id: string; name: string; cloud: "AWS" | "Azure" | "GCP" }[] = [
  { id: "1", name: "prod-us-west", cloud: "AWS" },
  { id: "5", name: "data-eng-prod", cloud: "Azure" },
  { id: "6", name: "ml-platform-prod", cloud: "GCP" },
  { id: "7", name: "analytics-prod", cloud: "AWS" },
  { id: "11", name: "marketing-analytics", cloud: "Azure" },
  { id: "20", name: "model-serving-prod", cloud: "AWS" },
]

// 30 daily spend buckets (in $K), Dec 19 → Jan 18. Choppy plateau around ~70–120K.
const SPEND_SERIES = [
  62, 74, 108, 102, 110, 104, 106, 60, 64, 128, 122, 130, 134, 128, 78, 82, 112,
  108, 106, 110, 116, 62, 64, 112, 108, 122, 130, 124, 68, 80,
]

const SPEND_TICKS = [
  { at: 1, label: "Dec 20" },
  { at: 8, label: "Dec 27" },
  { at: 15, label: "Jan 3" },
  { at: 22, label: "Jan 10" },
  { at: 29, label: "Jan 18" },
]

const TOP_PRODUCTS = [
  { name: "Model Serving", icon: ModelsIcon, spend: 805.0, label: "$805.0K" },
  { name: "SQL", icon: QueryIcon, spend: 499.9, label: "$499.9K" },
  { name: "Jobs", icon: WorkflowsIcon, spend: 492.6, label: "$492.6K" },
  { name: "All-Purpose Compute", icon: ChipIcon, spend: 332.0, label: "$332.0K" },
  { name: "DLT", icon: PipelineIcon, spend: 213.3, label: "$213.3K" },
]

const TOP_WORKSPACES = [
  { name: "analytics-prod", icon: ChipIcon, spend: 742.1, label: "$742.1K" },
  { name: "ml-platform", icon: ModelsIcon, spend: 610.5, label: "$610.5K" },
  { name: "data-eng", icon: WorkflowsIcon, spend: 458.0, label: "$458.0K" },
  { name: "bi-reporting", icon: QueryIcon, spend: 289.4, label: "$289.4K" },
  { name: "sandbox", icon: PipelineIcon, spend: 121.7, label: "$121.7K" },
]

// Placeholder budgets — each has a period, a used/limit amount, and a computed pct.
const BUDGETS = [
  { name: "Production compute", scope: "analytics-prod · Monthly", used: 84200, limit: 100000 },
  { name: "ML Serving", scope: "ml-platform · Monthly", used: 61500, limit: 60000 },
  { name: "Data engineering", scope: "data-eng · Monthly", used: 38900, limit: 75000 },
  { name: "BI & reporting", scope: "bi-reporting · Quarterly", used: 142000, limit: 150000 },
  { name: "Sandbox & dev", scope: "All dev workspaces · Monthly", used: 12100, limit: 20000 },
  { name: "AI Gateway", scope: "Account-wide · Monthly", used: 7400, limit: 10000 },
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

function CardFooterLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-8 w-full items-center justify-center gap-1 rounded border border-border text-sm text-foreground transition-colors hover:bg-muted"
    >
      {label}
      <ChevronRightIcon className="h-3.5 w-3.5" />
    </button>
  )
}

// A stat card: label + value, plus an optional "+x% vs. previous" delta line.
function StatCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex flex-col gap-1 p-4">
        <CardTitle>{label}</CardTitle>
        <div className="text-[18px] leading-6 font-semibold text-foreground">{value}</div>
        {delta && (
          <div className="text-sm text-foreground">
            {delta} <span className="text-muted-foreground">vs. previous</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Ranked horizontal-bar list — a product/workspace logo + name inside the bar, spend
// right-aligned. Bar width is proportional to the max in the set.
type RankedRow = { name: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; spend: number; label: string }

function RankedBarList({ header, rows }: { header: string; rows: RankedRow[] }) {
  const max = Math.max(...rows.map((r) => r.spend))
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{header}</span>
        <span>Spend</span>
      </div>
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div
              className="flex h-[22px] items-center gap-2 rounded bg-[var(--chart-bar)] px-2.5"
              style={{ width: `${Math.max((r.spend / max) * 100, 30)}%` }}
            >
              <DbIcon icon={r.icon} size={14} className="shrink-0 text-foreground" />
              <span className="truncate text-sm text-foreground">{r.name}</span>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-foreground">{r.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [group, setGroup] = React.useState<"products" | "workspaces">("products")

  // Prototype-only: the picker scopes the (mock) dashboard. "all" = across all workspaces.
  const [workspace, setWorkspace] = React.useState("all")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const selectedWorkspace = workspace === "all" ? undefined : COST_WORKSPACES.find((w) => w.id === workspace)
  const selectedLabel = selectedWorkspace?.name ?? "All workspaces"

  // Reshape the spend chart + headline stats for the selected workspace (stable per id).
  const spendSeries = React.useMemo(() => scaleSeries(SPEND_SERIES, workspace), [workspace])
  const spend30d = workspace === "all" ? "$2.8M" : `$${scaleValue(2.8, workspace).toFixed(2)}M`
  const spendMtd = workspace === "all" ? "$1.7M" : `$${scaleValue(1.7, workspace).toFixed(2)}M`
  const avgDaily = workspace === "all" ? "$94.9K" : `$${scaleValue(94.9, workspace).toFixed(1)}K`

  return (
    <AppShell activeItem="cost">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        <h1 className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
          <button
            type="button"
            onClick={() => setWorkspace("all")}
            className="rounded px-1 py-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cost
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
                    {COST_WORKSPACES.map((w) => (
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
            <TabsTrigger value="budgets" className="flex-none">Budgets</TabsTrigger>
            <TabsTrigger value="policies" className="flex-none">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-4">
        {/* Stat row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Spend in last 30 days" value={spend30d} delta="+0.2%" />
          <StatCard label="Spend (MTD)" value={spendMtd} delta="+0.2%" />
          <StatCard label="Average daily spend" value={avgDaily} delta="+0.2%" />
        </div>

        {/* Spend chart */}
        <Card className="py-0 shadow-none">
          <CardContent className="flex flex-col gap-3 p-4">
            <CardTitle>Spend over last 30 days</CardTitle>
            <BarChart
              data={spendSeries}
              xLabels={SPEND_TICKS}
              height={180}
              gap={6}
              formatY={(v) => (v === 0 ? "$0" : `$${v.toFixed(1)}K`)}
            />
            <CardFooterLink label="View spend by product" />
          </CardContent>
        </Card>

        {/* Bottom row: top groups (left) · tagged spend + budgets (right) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Top groups */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <CardTitle>Top groups in last 30 days</CardTitle>

              {/* Products / Workspaces toggle */}
              <div className="flex w-fit items-center gap-1 rounded bg-muted p-[3px]">
                {(["products", "workspaces"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroup(g)}
                    className={cn(
                      "rounded px-2.5 py-1 text-sm capitalize transition-colors",
                      group === g
                        ? "bg-background font-semibold text-foreground shadow-[var(--shadow-db-sm)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <RankedBarList
                header={group === "products" ? "Billing product" : "Workspace"}
                rows={group === "products" ? TOP_PRODUCTS : TOP_WORKSPACES}
              />
              <CardFooterLink label={group === "products" ? "View spend by product" : "View spend by workspace"} />
            </CardContent>
          </Card>

          {/* Tagged spend + Budgets stacked */}
          <div className="flex flex-col gap-4">
            <Card className="py-0 shadow-none">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Tagged spend</CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[18px] leading-6 font-semibold text-foreground">35.8%</span>
                    <span className="text-sm text-foreground">
                      +0.2 <span className="text-muted-foreground">vs. previous</span>
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400" style={{ width: "35.8%" }} />
                </div>
                <CardFooterLink label="View untagged spend" />
              </CardContent>
            </Card>

            <Card className="py-0 shadow-none">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Budgets</CardTitle>
                  <div className="text-[18px] leading-6 font-semibold text-foreground">3 exhausted of 16 total</div>
                </div>
                {/* Two-color track: exhausted (red) + remaining (green). */}
                <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
                  <div className="h-full rounded-full bg-destructive" style={{ width: `${(3 / 16) * 100}%` }} />
                  <div className="h-full flex-1 rounded-full bg-[var(--success)]" />
                </div>
                <CardFooterLink label="View all budgets" />
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="budgets" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-[280px] max-w-full">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search budgets…" className="pl-8" />
              </div>
              <Button size="sm" className="shrink-0">
                Create budget
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Budget name</TableHead>
                  <TableHead><Skeleton className="h-4 w-16 animate-none" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16 animate-none" /></TableHead>
                  <TableHead><Skeleton className="ml-auto h-4 w-16 animate-none" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16 animate-none" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BUDGETS.map((b) => (
                  <TableRow key={b.name}>
                    <TableCell className="font-normal text-foreground">{b.name}</TableCell>
                    <TableCell><Skeleton className="h-4 w-28 animate-none" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 animate-none" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-4 w-20 animate-none" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14 animate-none" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="policies">
            <Card className="py-0 shadow-none">
              <CardContent className="flex flex-col items-center justify-center gap-1 p-12 text-center">
                <div className="text-sm font-semibold text-foreground">Policies</div>
                <div className="text-sm text-muted-foreground">Define cost-control policies and guardrails.</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
