"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRightIcon } from "@/components/icons"
import { Info, ChevronDown } from "lucide-react"
import { BarChart, Donut, type DonutSlice } from "@/components/monitoring/charts"
import { cn } from "@/lib/utils"

// The Governance "Data" dashboard, rebuilt from the reference design. Numbers are mock
// data scoped to the selected metastore (see `buildDashboardData`). Rendered at the top
// of the unified /e/data surface, above the reused metastores management table.

const USAGE_TICKS = [
  { at: 0, label: "Jun 28" },
  { at: 7, label: "Jul 05" },
  { at: 14, label: "Jul 12" },
  { at: 21, label: "Jul 19" },
  { at: 26, label: "Jul 26" },
]

// Deterministic PRNG so a given metastore always yields the same figures across renders.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFrom(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0
  return h
}

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${Math.round(n)}`
}

export type DashboardData = {
  totalCatalogs: string
  totalAssets: string
  governedTags: string
  usageQueries: string
  usageBars: number[]
  grants: string
  accessSlices: DonutSlice[]
  classificationPct: number
  qualityPct: number
  recommendations: { title: string; detail: string }[]
}

// Aggregate figures shown for "All metastores" (matches the reference design).
const ALL_DATA: DashboardData = {
  totalCatalogs: "131.8K",
  totalAssets: "62.4M",
  governedTags: "1K",
  usageQueries: "54.7M queries",
  // ~30 daily query counts (in millions) — plateau then a late climb, matching the ref.
  usageBars: [
    0.2, 1.3, 1.1, 1.25, 1.8, 1.2, 1.22, 1.4, 1.7, 1.9, 1.85, 2.25, 1.8, 1.75, 1.7,
    1.65, 1.62, 1.7, 1.75, 1.8, 2.45, 2.55, 2.62, 2.6, 2.6, 2.55, 2.05,
  ],
  grants: "84.5M grants",
  accessSlices: [
    { label: "Data Asset", value: 95.7, color: "var(--color-blue-600)" },
    { label: "Schema",     value: 3.8,  color: "var(--color-blue-500)" },
    { label: "Catalog",    value: 0.5,  color: "var(--color-blue-400)" },
    { label: "Metastore",  value: 0.0,  color: "var(--muted-foreground)" },
  ],
  classificationPct: 22.9,
  qualityPct: 99.6,
  recommendations: [
    { title: "Missing tags on popular tables",          detail: "20 popular tables do not have tags." },
    { title: "Missing comments on popular tables",       detail: "20 popular tables do not have comments." },
    { title: "Unused assets suggested for deprecation",  detail: "20 unused tables recommended for deprecation." },
  ],
}

// Per-metastore figures — deterministically derived from the id so they're stable but
// clearly different per selection. A single metastore is a fraction of the org total.
export function buildDashboardData(metastoreId: string): DashboardData {
  if (metastoreId === "all") return ALL_DATA

  const rand = mulberry32(seedFrom(metastoreId))
  const scale = 0.04 + rand() * 0.18 // 4%–22% of the org aggregate

  const catalogs = Math.round(131_800 * scale)
  const assets = Math.round(62_400_000 * scale)
  const tags = Math.round(1_000 * scale) + 20
  const queries = 54.7 * scale // in millions
  const grants = 84.5 * scale  // in millions
  const peak = 0.3 + rand() * 2.7
  const usageBars = Array.from({ length: 27 }, (_, i) => {
    const trend = (i / 26) * peak * 0.6
    return Math.max(0.05, trend + rand() * peak * 0.5)
  })

  // Access mix varies a little per metastore but stays a single-hue breakdown.
  const dataAsset = 88 + rand() * 10
  const schema = (100 - dataAsset) * (0.6 + rand() * 0.3)
  const catalog = (100 - dataAsset - schema) * 0.8
  const metastore = Math.max(0, 100 - dataAsset - schema - catalog)

  const missingTags = 3 + Math.round(rand() * 24)
  const missingComments = 3 + Math.round(rand() * 24)
  const unused = 2 + Math.round(rand() * 18)

  return {
    totalCatalogs: fmtCount(catalogs),
    totalAssets: fmtCount(assets),
    governedTags: fmtCount(tags),
    usageQueries: `${queries.toFixed(1)}M queries`,
    usageBars,
    grants: `${grants.toFixed(1)}M grants`,
    accessSlices: [
      { label: "Data Asset", value: +dataAsset.toFixed(1), color: "var(--color-blue-600)" },
      { label: "Schema",     value: +schema.toFixed(1),    color: "var(--color-blue-500)" },
      { label: "Catalog",    value: +catalog.toFixed(1),   color: "var(--color-blue-400)" },
      { label: "Metastore",  value: +metastore.toFixed(1), color: "var(--muted-foreground)" },
    ],
    classificationPct: +(8 + rand() * 55).toFixed(1),
    qualityPct: +(94 + rand() * 5.8).toFixed(1),
    recommendations: [
      { title: "Missing tags on popular tables",          detail: `${missingTags} popular tables do not have tags.` },
      { title: "Missing comments on popular tables",       detail: `${missingComments} popular tables do not have comments.` },
      { title: "Unused assets suggested for deprecation",  detail: `${unused} unused tables recommended for deprecation.` },
    ],
  }
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
      {children}
      <Info className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  )
}

// A widget header: the metric label + value on the left, a "Review" text link on the
// right. The link replaces the old full-width footer button.
function WidgetHeader({
  label,
  value,
  reviewLabel,
}: {
  label: React.ReactNode
  value: React.ReactNode
  reviewLabel: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <StatLabel>{label}</StatLabel>
        <div className="text-[18px] leading-6 font-semibold text-foreground">{value}</div>
      </div>
      <a href="#" className="mt-0.5 flex shrink-0 items-center gap-0.5 text-sm text-primary">
        {reviewLabel}
        <ChevronRightIcon className="h-4 w-4" />
      </a>
    </div>
  )
}

export function DataGovernanceDashboard({ metastoreId = "all" }: { metastoreId?: string }) {
  const data = React.useMemo(() => buildDashboardData(metastoreId), [metastoreId])

  // Metrics grid — the recommendations rail lives at the page level so it can span the
  // full content height (see DataRecommendationsPanel).
  return (
      <div className="flex flex-col gap-4">
        {/* Stat row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-1 p-4">
              <StatLabel>Total Catalogs</StatLabel>
              <div className="text-[18px] leading-6 font-semibold text-foreground">{data.totalCatalogs}</div>
            </CardContent>
          </Card>
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-1 p-4">
              <StatLabel>Total Assets</StatLabel>
              <div className="text-[18px] leading-6 font-semibold text-foreground">{data.totalAssets}</div>
            </CardContent>
          </Card>
          <Card className="py-0 shadow-none">
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="flex min-w-0 flex-col gap-1">
                <StatLabel>Governed Tags</StatLabel>
                <div className="text-[18px] leading-6 font-semibold text-foreground">{data.governedTags}</div>
              </div>
              <a href="/tags" className="mt-0.5 shrink-0 text-sm text-primary">Manage</a>
            </CardContent>
          </Card>
        </div>

        {/* Chart row */}
        <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <WidgetHeader label="Asset Usage" value={data.usageQueries} reviewLabel="Review" />
              <BarChart
                data={data.usageBars}
                xLabels={USAGE_TICKS}
                height={170}
                formatY={(v) => (v === 0 ? "0" : `${v % 1 === 0 ? v : v.toFixed(0)}M`)}
              />
            </CardContent>
          </Card>

          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <WidgetHeader label="Access Summary" value={data.grants} reviewLabel="Review" />
              <div className="flex flex-1 items-center py-2">
                <Donut slices={data.accessSlices} formatValue={(v) => `${v.toFixed(1)}%`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress row */}
        <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <WidgetHeader label="Data Classification" value={`${data.classificationPct}% tables with detections`} reviewLabel="Review" />
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${data.classificationPct}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
              <WidgetHeader label="Data Quality" value={`${data.qualityPct}% healthy tables`} reviewLabel="Review" />
              {/* Two-color track: healthy (green) + tiny unhealthy (red) remainder. */}
              <div className="flex h-2 w-full overflow-hidden rounded-full">
                <div className="h-full bg-[var(--trend-positive)]" style={{ width: `${data.qualityPct}%` }} />
                <div className="h-full flex-1 bg-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

// The Data recommendations rail — rendered at the page level so it can span the full
// content height alongside both the dashboard and the metastore list. Its open/closed
// state is owned by the page; the toggle lives in the page title row.
export function DataRecommendationsPanel({ metastoreId = "all" }: { metastoreId?: string }) {
  const data = React.useMemo(() => buildDashboardData(metastoreId), [metastoreId])

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center border-b border-border px-4 py-1 text-sm font-semibold text-foreground">
        Data recommendations
      </div>
      {data.recommendations.map((rec) => (
        <div key={rec.title} className="flex items-start justify-between gap-2 border-b border-border p-6 last:border-b-0">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="text-sm font-semibold text-foreground">{rec.title}</div>
            <div className="text-sm text-muted-foreground">{rec.detail}</div>
          </div>
          {/* Non-interactive per-row chevron (decorative), pointing right. */}
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 -rotate-90 text-muted-foreground" aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}
