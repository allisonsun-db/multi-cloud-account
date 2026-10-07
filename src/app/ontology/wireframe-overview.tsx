"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SnippetSourcesChart } from "./snippet-sources"
import {
  CONTRIBUTORS, domainName,
} from "./data"

// Overview widgets in wireframe style: three parallel sections (Impact · Inventory ·
// Access), each = header + 3 KPIs + visualizations that break the KPIs down. Gray
// placeholder sketches stand in for the charts. Used by the Overview tab and by the
// /ontology/wireframe page.

type Kpi = { label: string; value: string; caption: string }
// `rows`, when present, drives a labeled sketch with real widths and hover details.
type SketchRow = { label: string; width: number; filled?: number; empty?: string; detail: React.ReactNode }
// `chart`, when present, renders a built chart instead of a sketch.
type Viz = { title: string; kind: string; answers: string; labels?: string[]; widths?: number[]; rows?: SketchRow[]; chart?: React.ReactNode }

// ─── Hover details (Access) ────────────────────────────────────────────────────

function DetailLine({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="opacity-70">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  )
}

// Top contributors: total pages + snippets + tables, top 5.
export const CONTRIBUTOR_ROWS: SketchRow[] = (() => {
  const rows = CONTRIBUTORS
    .map((c) => ({ ...c, total: c.pages + c.snippets + c.tables }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
  const max = Math.max(...rows.map((r) => r.total), 1)
  return rows.map((r) => ({
    label: r.name,
    width: (r.total / max) * 100,
    detail: (
      <div className="flex min-w-[220px] flex-col gap-1">
        <span className="font-semibold">{r.name}</span>
        <DetailLine k="Contributions" v={r.total.toLocaleString()} />
        <DetailLine k="Pages" v={r.pages.toLocaleString()} />
        <DetailLine k="Snippets" v={r.snippets.toLocaleString()} />
        <DetailLine k="Tables" v={r.tables.toLocaleString()} />
        <DetailLine k="Domains" v={r.domains.map(domainName).join(", ")} />
      </div>
    ),
  }))
})()

const SECTIONS: { title: string; question: string; link?: { label: string; tab: string }; kpis: Kpi[]; viz: Viz[] }[] = [
  {
    title: "Impact",
    question: "Is the ontology improving Genie?",
    kpis: [
      { label: "Questions using ontology", value: "59%", caption: "4.2K of 7.0K questions" },
      { label: "Answer time", value: "2.8× faster", caption: "4.1s vs. 11.6s" },
      { label: "Zero-result searches", value: "8.6%", caption: "−9.8 pts vs. 12 weeks ago" },
    ],
    viz: [
      { title: "Questions using ontology, by domain", kind: "Horizontal bars · using ontology vs. not", answers: "Where is ontology use low?", labels: ["Sales", "Finance", "Supply Chain", "Customer Support", "Marketing"] },
    ],
  },
  {
    title: "Inventory",
    question: "What does Genie know, and what feeds it?",    kpis: [
      { label: "Ontology assets", value: "5.3K", caption: "4,812 snippets · 386 pages · 112 metric views" },
      { label: "Certified assets", value: "189", caption: "" },
      { label: "Connections", value: "7", caption: "" },
    ],
    viz: [
      { title: "Top snippet sources", kind: "Snippets · retrievals · authority · access per connector", answers: "Where does knowledge come from, and who can use it?", chart: <SnippetSourcesChart /> },
    ],
  },
  {
    title: "Access",
    question: "Who shapes the ontology, and who's blocked?",
    // Write side (curators, contributors) and read side (blocked users): one KPI and
    // one breakdown per question.
    kpis: [
      { label: "Curators", value: "9", caption: "3 domains have none" },
      { label: "Active contributors", value: "6", caption: "Top: Elena Vasquez · 907 contributions" },
      { label: "Users missing data access", value: "5", caption: "of 412 Genie users" },
    ],
    viz: [
      { title: "Top contributors", kind: "Ranked bars · contributions per user", answers: "Who adds the most to the ontology?", rows: CONTRIBUTOR_ROWS },
    ],
  },
]

export function Box({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`rounded-md border border-border bg-muted/60 ${className ?? ""}`}>{children}</div>
}

function Bar({ w, className }: { w: string; className?: string }) {
  return <div className={`h-2 rounded-full bg-muted-foreground/25 ${className ?? ""}`} style={{ width: w }} />
}

// Labeled sketch rows with hover details (same gray wireframe style).
export function DetailRows({ rows }: { rows: SketchRow[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <Tooltip key={r.label}>
          <TooltipTrigger asChild>
            <div className="flex cursor-default items-center gap-3 rounded hover:bg-muted-foreground/10">
              <span className="w-[120px] shrink-0 truncate text-sm text-muted-foreground">{r.label}</span>
              <div className="min-w-0 flex-1">
                {r.width === 0 ? (
                  <span className="text-sm text-muted-foreground">{r.empty ?? "None"}</span>
                ) : r.filled === undefined ? (
                  <div className="h-[18px] rounded-[3px] bg-muted-foreground/25" style={{ width: `${r.width}%` }} />
                ) : (
                  <div className="flex h-[18px] gap-0.5" style={{ width: `${r.width}%` }}>
                    <div className="h-full rounded-l-[3px] bg-muted-foreground/40" style={{ width: `${r.filled}%` }} />
                    {r.filled < 100 && <div className="h-full flex-1 rounded-r-[3px] bg-muted-foreground/15" />}
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="start">{r.detail}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export function VizSketch({ kind, labels, widths: customWidths }: { kind: string; labels?: string[]; widths?: number[] }) {
  if (kind.startsWith("Bar chart")) {
    return (
      <div className="flex h-24 items-end gap-1.5">
        {[90, 85, 76, 72, 64, 60, 55, 48, 45, 40, 41, 36].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-[2px] bg-muted-foreground/25" style={{ height: `${h}%` }} />
        ))}
      </div>
    )
  }
  if (kind.startsWith("Status") || kind.startsWith("List")) {
    return (
      <div className="flex flex-col gap-2.5">
        {[70, 55, 62, 48].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <Bar w={`${w}%`} />
            <div className="h-2 w-8 rounded-full bg-muted-foreground/25" />
          </div>
        ))}
      </div>
    )
  }
  const widths = customWidths ?? [100, 62, 48, 40, 30]
  if (kind.startsWith("Two-tone")) {
    // Bar = users who needed the source; dark = has access, light = missing.
    const rows = [[100, 76], [76, 59], [62, 83], [50, 42], [44, 100]]
    return (
      <div className="flex flex-col gap-2.5">
        {rows.map(([w, filled], i) => (
          <div key={i} className="flex items-center gap-3">
            {labels && <span className="w-[120px] shrink-0 truncate text-sm text-muted-foreground">{labels[i]}</span>}
            <div className="min-w-0 flex-1">
              <div className="flex h-[18px] gap-0.5" style={{ width: `${w}%` }}>
                <div className="h-full rounded-l-[3px] bg-muted-foreground/40" style={{ width: `${filled}%` }} />
                {filled < 100 && <div className="h-full flex-1 rounded-r-[3px] bg-muted-foreground/15" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (labels) {
    return (
      <div className="flex flex-col gap-2.5">
        {widths.map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-[120px] shrink-0 truncate text-sm text-muted-foreground">{labels[i]}</span>
            <div className="min-w-0 flex-1">
              {w === 0 ? (
                <span className="text-sm text-muted-foreground">None</span>
              ) : (
                <div className="h-[18px] rounded-[3px] bg-muted-foreground/25" style={{ width: `${w}%` }} />
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2.5">
      {widths.map((w, i) => <Bar key={i} w={`${w}%`} className="h-3" />)}
    </div>
  )
}

export function WireframeOverview({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map((section) => (
        <section key={section.title} className="flex flex-col gap-3 pt-4 first:pt-0">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[18px] leading-6 font-semibold text-foreground">{section.title}</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="More info" className="inline-flex">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">{section.question}</TooltipContent>
              </Tooltip>
            </div>
            {section.link && (
              <button
                type="button"
                onClick={() => section.link && onNavigate?.(section.link.tab)}
                className="text-sm text-primary hover:underline"
              >
                View {section.link.label} ›
              </button>
            )}
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {section.kpis.map((k) => (
              <Box key={k.label} className="flex flex-col gap-1 p-4">
                <span className="text-sm font-semibold text-foreground">{k.label}</span>
                <span className="text-[22px] leading-7 font-semibold text-foreground">{k.value}</span>
                {k.caption && <span className="text-sm text-muted-foreground">{k.caption}</span>}
              </Box>
            ))}
          </div>

          {/* Visualization row */}
          <div className={`grid gap-4 ${section.viz.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {section.viz.map((v) => (
              <Box key={v.title} className="flex flex-col gap-3 p-4">
                <span className="text-sm font-semibold text-foreground">{v.title}</span>
                {v.chart ?? (v.rows ? <DetailRows rows={v.rows} /> : <VizSketch kind={v.kind} labels={v.labels} widths={v.widths} />)}
              </Box>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
