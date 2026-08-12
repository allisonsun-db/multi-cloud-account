"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart } from "@/components/monitoring/charts"
import { scaleSeries, scaleValue } from "@/lib/scope-data"
import { CLOUD_LOGO } from "@/components/ui/location-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Info, ChevronDown, Check } from "lucide-react"
import { ChevronRightIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

// Tags monitoring surface — a read-only "how is tagging doing across the account"
// dashboard. Two small stat cards up top (Governed Tags, Domains), two chart cards
// (recent assignments over time, most-used governed tags), and two coverage cards
// (data classification, tagged spend) with gradient progress meters. Mock data only.

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

// Daily tag-assignment volume, ~July 12 → mid August (matches the screenshot shape).
const ASSIGNMENT_SERIES = [
  9.4, 9.6, 12.1, 10.6, 17.8, 7.4, 3.1, 0.8, 0.9, 1.4, 1.5, 6.8, 1.2, 0.7, 0.5,
  1.1, 2.6, 3.2, 3.4, 4.7, 16.9, 6.6, 1.1, 13.5, 6.9, 2.3, 2.4, 4.9, 0.9,
]

const ASSIGNMENT_X_LABELS = [
  { at: 0, label: "July 12" },
  { at: 8, label: "July 20" },
  { at: 16, label: "July 28" },
  { at: 24, label: "August 5" },
]

const POPULAR_TAGS = [
  { tag: "class.location", assets: 13.8 },
  { tag: "class.name", assets: 12.1 },
  { tag: "class.email_address", assets: 11.8 },
  { tag: "some_id", assets: 9.7 },
  { tag: "owner", assets: 8.6 },
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

// A gradient progress meter (used by Data Classification & Tagged spend).
function GradientMeter({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const maxAssets = Math.max(...POPULAR_TAGS.map((t) => t.assets))

  // Prototype-only: the picker scopes the (mock) dashboard. "all" = across all workspaces.
  const [workspace, setWorkspace] = React.useState("all")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const selectedWorkspace = workspace === "all" ? undefined : WORKSPACES.find((w) => w.id === workspace)
  const selectedLabel = selectedWorkspace?.name ?? "All workspaces"

  // Reshape the assignments chart + headline numbers for the selected workspace.
  const assignmentSeries = React.useMemo(() => scaleSeries(ASSIGNMENT_SERIES, workspace), [workspace])
  const assignmentsLabel = workspace === "all" ? "142.2K assignments" : `${scaleValue(142.2, workspace).toFixed(1)}K assignments`
  const assetsLabel = workspace === "all" ? "75.8K assets tagged" : `${scaleValue(75.8, workspace).toFixed(1)}K assets tagged`

  return (
    <AppShell activeItem="tags">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-6">
        <h1 className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold text-foreground">
          <button
            type="button"
            onClick={() => setWorkspace("all")}
            className="rounded px-1 py-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Tags
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* ── Governed Tags ─────────────────────────────────────────── */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-1 p-4">
              <CardTitle>Governed Tags</CardTitle>
              <div className="text-[18px] leading-6 font-semibold text-foreground">1K</div>
              <button type="button" className="self-start text-sm text-primary hover:underline">
                Manage
              </button>
            </CardContent>
          </Card>

          {/* ── Domains ───────────────────────────────────────────────── */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-1 p-4">
              <CardTitle>Domains</CardTitle>
              <div className="text-[18px] leading-6 font-semibold text-foreground">83</div>
              <button type="button" className="self-start text-sm text-primary hover:underline">
                Manage
              </button>
            </CardContent>
          </Card>

          {/* ── Recent tag assignments ────────────────────────────────── */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Recent tag assignments</CardTitle>
                <div className="text-[18px] leading-6 font-semibold text-foreground">{assignmentsLabel}</div>
              </div>
              <BarChart
                data={assignmentSeries}
                xLabels={ASSIGNMENT_X_LABELS}
                height={150}
                gap={6}
                formatY={(v) => (v >= 1 ? `${Math.round(v)}K` : "0")}
              />
              <CardFooterLink label="Review Tag Assignments" />
            </CardContent>
          </Card>

          {/* ── Governed tag usage ────────────────────────────────────── */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Governed tag usage</CardTitle>
                <div className="text-[18px] leading-6 font-semibold text-foreground">{assetsLabel}</div>
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tag</span>
                  <span>Assets</span>
                </div>
                {POPULAR_TAGS.map((t) => (
                  <div key={t.tag} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div
                        className="flex h-6 items-center rounded bg-[var(--chart-bar)] px-2.5"
                        style={{ width: `${Math.max((t.assets / maxAssets) * 100, 24)}%` }}
                      >
                        <span className="truncate text-sm text-foreground">{t.tag}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {t.assets.toFixed(1)}K
                    </span>
                  </div>
                ))}
              </div>

              <CardFooterLink label="Review Popular Tags" />
            </CardContent>
          </Card>

          {/* ── Data Classification ───────────────────────────────────── */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Data Classification</CardTitle>
                <div className="text-[18px] leading-6 font-semibold text-foreground">21.2% tables with detections</div>
              </div>
              <GradientMeter pct={21.2} />
              <CardFooterLink label="Review Data Classifications" />
            </CardContent>
          </Card>

          {/* ── Tagged spend ──────────────────────────────────────────── */}
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Tagged spend</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-[18px] leading-6 font-semibold text-foreground">41.3%</span>
                  <span className="text-sm text-foreground">
                    +15.0 <span className="text-muted-foreground">vs. previous</span>
                  </span>
                </div>
              </div>
              <GradientMeter pct={41.3} />
              <CardFooterLink label="View untagged spend" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
