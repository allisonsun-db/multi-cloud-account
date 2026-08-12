"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart } from "@/components/monitoring/charts"
import { scaleSeries, scaleValue } from "@/lib/scope-data"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Info, User, Sparkles, Infinity as InfinityIcon, Atom, ChevronDown, Check } from "lucide-react"
import { ChevronRightIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

// AI monitoring surface — a read-only "how is AI usage doing across the account"
// dashboard. Three stat cards up top (Token Usage, Governed Traffic, Gateway Budgets),
// two chart cards (usage & spend over 30d), and two ranked-list cards (top model
// families and top users by spend). Mock data only.

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

// 30 daily buckets, Jul 12 → Aug 9. Usage in thousands of requests; near-zero most
// days with two big spikes late July (matches the screenshot shape).
const USAGE_SERIES = [
  0.4, 1.8, 2.6, 3.9, 3.2, 2.4, 1.1, 3.4, 137, 64, 157, 4.2, 2.1, 3.6, 2.8,
  1.4, 5.6, 6.9, 1.2, 0.8, 3.1, 4.2, 3.4, 1.6, 0.9, 1.1, 0.7, 3.8,
]

// AI spend in dollars per day — flat early, then a busy late-July/August stretch.
const SPEND_SERIES = [
  4, 6, 132, 44, 8, 6, 4, 5, 520, 720, 400, 380, 810, 12, 550, 160, 110, 320, 400,
  60, 690, 300, 410, 130, 570, 30, 40, 470,
]

const DATE_TICKS = [
  { at: 0, label: "Jul 12" },
  { at: 4, label: "Jul 16" },
  { at: 8, label: "Jul 20" },
  { at: 12, label: "Jul 24" },
  { at: 16, label: "Jul 28" },
  { at: 20, label: "Aug 1" },
  { at: 24, label: "Aug 5" },
  { at: 27, label: "Aug 9" },
]

const MODEL_FAMILIES = [
  { name: "Gemini", spend: 3200, label: "$3.2K" },
  { name: "Llama", spend: 2000, label: "$2.0K" },
  { name: "Claude", spend: 1100, label: "$1.1K" },
  { name: "GPT", spend: 644.4, label: "$644.4" },
  { name: "GLM", spend: 394.5, label: "$394.5" },
]

const ACTIVE_USERS = [
  { name: "Erik Lindgren", spend: 1600, label: "$1.6K" },
  { name: "Yu-Chieh Tu", spend: 1400, label: "$1.4K" },
  { name: "Zhizhao Wen", spend: 1100, label: "$1.1K" },
  { name: "Nishith Sinha", spend: 520.9, label: "$520.9" },
  { name: "Jean Verrons", spend: 391.4, label: "$391.4" },
]

// ─── Model-family logos ──────────────────────────────────────────────────────────
// The screenshot shows a small white brand mark inside each model bar. DuBois/Lucide
// cover a few (Gemini→sparkle, Llama→infinity, GLM→atom); the Anthropic "A\" and the
// OpenAI knot aren't in either set, so they're minimal inline SVGs in currentColor.

function AnthropicMark(props: React.SVGProps<SVGSVGElement>) {
  // Stylized "A\" — Anthropic's Claude wordmark glyph, simplified.
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path d="M4.2 12.5 7.1 3.5h1.9l2.9 9h-1.8l-.62-2H6.6l-.6 2H4.2Zm2.9-3.5h2.1L8.15 5.4 7.1 9Z" fill="currentColor" />
    </svg>
  )
}

function OpenAIMark(props: React.SVGProps<SVGSVGElement>) {
  // Simplified OpenAI knot — a ring with a notch, evocative not exact.
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 3v5l3.5 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const MODEL_ICON: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Gemini: Sparkles,
  Llama: InfinityIcon,
  Claude: AnthropicMark,
  GPT: OpenAIMark,
  GLM: Atom,
}

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

// A ranked horizontal-bar list (top model families / users by spend). The label sits
// inside the bar; the value is right-aligned. Bar width is proportional to the max.
function RankedBarList({
  columns,
  rows,
  showUserIcon,
}: {
  columns: [string, string]
  rows: { name: string; spend: number; label: string }[]
  showUserIcon?: boolean
}) {
  const max = Math.max(...rows.map((r) => r.spend))
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{columns[0]}</span>
        <span>{columns[1]}</span>
      </div>
      {rows.map((r) => {
        const Logo = showUserIcon ? User : MODEL_ICON[r.name]
        return (
          <div key={r.name} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div
                className="flex h-6 items-center gap-2 rounded bg-[var(--color-blue-500)] px-2.5"
                style={{ width: `${Math.max((r.spend / max) * 100, 24)}%` }}
              >
                {Logo && <Logo className="h-3.5 w-3.5 shrink-0 text-white" />}
                <span className="truncate text-sm text-white">{r.name}</span>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-foreground">{r.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  // Prototype-only: the picker scopes the (mock) dashboard. "all" = across all workspaces.
  const [workspace, setWorkspace] = React.useState("all")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const selectedWorkspace = workspace === "all" ? undefined : WORKSPACES.find((w) => w.id === workspace)
  const selectedLabel = selectedWorkspace?.name ?? "All workspaces"

  // Reshape the charts + headline numbers for the selected workspace (stable per id).
  const usageSeries = React.useMemo(() => scaleSeries(USAGE_SERIES, workspace), [workspace])
  const spendSeries = React.useMemo(() => scaleSeries(SPEND_SERIES, workspace), [workspace])
  const requestsLabel = workspace === "all" ? "412K requests" : `${Math.round(scaleValue(412, workspace))}K requests`
  const spendLabel = workspace === "all" ? "$7.4K" : `$${scaleValue(7.4, workspace).toFixed(1)}K`

  return (
    <AppShell activeItem="ai">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        <h1 className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
          <button
            type="button"
            onClick={() => setWorkspace("all")}
            className="rounded px-1 py-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            AI
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

        {/* Stat row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-1 p-4">
              <CardTitle>Token Usage</CardTitle>
              <div className="text-[18px] leading-6 font-semibold text-foreground">2.7B</div>
            </CardContent>
          </Card>
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-1 p-4">
              <CardTitle>Governed Traffic</CardTitle>
              <div className="text-[18px] leading-6 font-semibold text-foreground">3% governed</div>
            </CardContent>
          </Card>
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-1 p-4">
              <CardTitle>Unity AI Gateway Budgets</CardTitle>
              <div className="text-[18px] leading-6 font-semibold text-foreground">43 exhausted budgets</div>
              <button type="button" className="self-start text-sm text-primary hover:underline">
                Manage
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Chart row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>AI Usage (30d)</CardTitle>
                <div className="text-[18px] leading-6 font-semibold text-foreground">{requestsLabel}</div>
              </div>
              <BarChart
                data={usageSeries}
                xLabels={DATE_TICKS}
                height={150}
                gap={6}
                formatY={(v) => (v >= 1 ? `${Math.round(v)}K` : "0")}
              />
              <CardFooterLink label="Review AI Usage" />
            </CardContent>
          </Card>

          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>AI Spend (30d)</CardTitle>
                <div className="text-[18px] leading-6 font-semibold text-foreground">{spendLabel}</div>
              </div>
              <BarChart
                data={spendSeries}
                xLabels={DATE_TICKS}
                height={150}
                gap={6}
                formatY={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(2)}K` : `$${v.toFixed(2)}`)}
              />
              <CardFooterLink label="Review AI Spend" />
            </CardContent>
          </Card>
        </div>

        {/* Ranked-list row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Active Models (30d)</CardTitle>
                <div className="text-[18px] leading-6 font-semibold text-foreground">13 model families</div>
              </div>
              <RankedBarList columns={["Model family", "Spend"]} rows={MODEL_FAMILIES} />
              <CardFooterLink label="Review Model Families" />
            </CardContent>
          </Card>

          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Active Users (30d)</CardTitle>
                <div className="text-[18px] leading-6 font-semibold text-foreground">282 users</div>
              </div>
              <RankedBarList columns={["User", "Spend"]} rows={ACTIVE_USERS} showUserIcon />
              <CardFooterLink label="Review Active Users" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
