"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Box } from "./wireframe-overview"
import { SnippetSourcesChart } from "./snippet-sources"
import { DOMAINS, DOMAIN_INVENTORY, INITIAL_GRANTS, INITIAL_SOURCES, MOST_NEEDED_SOURCES, domainName } from "./data"

// Unified Overview wireframe — one page, one hierarchy: status → what needs attention
// → supporting detail. The three topics (Impact · Inventory · Access) stay labeled but
// are no longer three stacked dashboards.

type Topic = "Impact" | "Inventory" | "Access"

// ─── Scorecard ─────────────────────────────────────────────────────────────────
// One card per topic: a hero KPI (the topic's headline) with two supporting KPIs
// smaller, side by side below — so each card has one obvious place to look first.

type K = { label: string; value: string; caption?: string }
const STATUS: { topic: Topic; hero: K; support: [K, K] }[] = [
  {
    topic: "Impact",
    hero: { label: "Questions using ontology", value: "59%", caption: "4.2K of 7.0K questions" },
    support: [
      { label: "Faster with ontology", value: "2.8×", caption: "4.1s vs. 11.6s median" },
      { label: "Zero-result searches", value: "8.6%", caption: "−9.8 pts vs. 12 weeks ago" },
    ],
  },
  {
    topic: "Inventory",
    hero: { label: "Ontology assets", value: "5.3K", caption: "4,812 snippets · 386 pages · 112 metric views" },
    support: [
      { label: "Certified assets", value: "189", caption: "of 498 pages & metric views" },
      // Derived from INITIAL_SOURCES so it matches the Sources tab.
      { label: "Connections", value: `${INITIAL_SOURCES.length}`, caption: INITIAL_SOURCES.map((s) => s.name).join(" · ") },
    ],
  },
  {
    topic: "Access",
    hero: { label: "Users missing access", value: "5", caption: "of 412 Genie users" },
    support: [
      { label: "Curators", value: "9", caption: "3 domains have none" },
      { label: "Active contributors", value: "6", caption: "Top: Elena Vasquez · 907" },
    ],
  },
]

function StatusBand() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {STATUS.map((group) => (
        <Box key={group.topic} className="flex flex-col gap-3 p-4">
          <span className="-mb-2 text-sm font-semibold text-accent-foreground">{group.topic}</span>
          {/* Hero */}
          <div className="flex min-w-0 flex-col">
            <span className="text-[24px] leading-8 font-semibold text-foreground">{group.hero.value}</span>
            <span className="text-sm text-foreground">{group.hero.label}</span>
            {group.hero.caption && (
              <span className="truncate text-xs text-muted-foreground" title={group.hero.caption}>{group.hero.caption}</span>
            )}
          </div>
          {/* Supporting */}
          <div className="grid grid-cols-2 gap-3 border-t border-dashed border-muted-foreground/30 pt-3">
            {group.support.map((k) => (
              <div key={k.label} className="flex min-w-0 flex-col" title={k.caption}>
                <span className="text-[18px] leading-6 font-semibold text-foreground">{k.value}</span>
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
            ))}
          </div>
        </Box>
      ))}
    </div>
  )
}

// ─── Recommendations rail ───────────────────────────────────────────────────────
// Right-hand panel (same pattern as other monitoring pages): each item is an action,
// the reason it's recommended, and — expanded — the specifics plus a link to act.
// Every item derives from the same data the scorecard and charts use.

type Recommendation = { id: string; title: string; reason: string; details: React.ReactNode; action: string; tab: string }

function recommendations(): Recommendation[] {
  const recs: Recommendation[] = []

  const gap = DOMAIN_INVENTORY.filter((d) => d.coverage === "gap").sort((a, b) => a.groundedPct - b.groundedPct)[0]
  if (gap) {
    const topic = gap.coverageDetail?.match(/“([^”]+)”/)?.[1]
    recs.push({
      id: "gap",
      title: topic ? `Add a page for “${topic}”` : `Curate ${domainName(gap.domain)}`,
      reason: `Only ${gap.groundedPct}% of ${domainName(gap.domain)} questions use ontology`,
      details: gap.coverageDetail ? `${domainName(gap.domain)}: ${gap.coverageDetail}.` : null,
      action: "Open Ontology map",
      tab: "map",
    })
  }

  const uncurated = DOMAINS.filter((d) => !INITIAL_GRANTS.some((g) => g.scope !== "account" && g.scope.includes(d.id)))
  if (uncurated.length) {
    recs.push({
      id: "curators",
      title: `Assign curators to ${uncurated.length} domains`,
      reason: "Gaps in these domains can't be routed to a domain expert",
      details: `No domain-level Manage Discovery: ${uncurated.map((d) => d.name).join(", ")}.`,
      action: "Grant Manage Discovery",
      tab: "governance",
    })
  }

  const broken = INITIAL_SOURCES.filter((s) => s.status === "Needs attention")
  if (broken.length) {
    recs.push({
      id: "connections",
      title: broken.length === 1 ? `Fix the ${broken[0].name} connection` : `Fix ${broken.length} connections`,
      reason: `Knowledge from ${broken.length === 1 ? broken[0].name : "these sources"} may be stale or missing`,
      details: (
        <ul className="flex flex-col gap-0.5">
          {broken.map((s) => <li key={s.id}>{s.name}: {s.detail}</li>)}
        </ul>
      ),
      action: "View sources & connectors",
      tab: "sources",
    })
  }

  const worst = [...MOST_NEEDED_SOURCES].sort((a, b) => b.missing - a.missing)[0]
  if (worst && worst.missing > 0) {
    recs.push({
      id: "access",
      title: `Grant access to ${worst.name}`,
      reason: `${worst.missing} of ${worst.needed} users who need it can't read it`,
      details: `Owner: ${worst.owner}. Granting read access unblocks Genie answers that rely on this ${worst.type.toLowerCase()}.`,
      action: "Review data access",
      tab: "governance",
    })
  }
  return recs
}

function RecommendationsPanel({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const recs = recommendations()
  const [open, setOpen] = React.useState<string | null>(null)
  return (
    <Box className="flex flex-col">
      <span className="mx-4 border-b border-border py-3 text-sm font-semibold text-foreground">
        Ontology recommendations
      </span>
      {recs.map((r) => {
        const expanded = open === r.id
        return (
          <div key={r.id} className="mx-4 border-b border-border py-4 last:border-b-0">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : r.id)}
              aria-expanded={expanded}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">{r.title}</span>
                <span className="text-sm text-muted-foreground">{r.reason}</span>
              </span>
              <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {expanded && (
              <div className="flex flex-col gap-3 pt-3 text-sm text-muted-foreground">
                {r.details && <div>{r.details}</div>}
                <button
                  type="button"
                  onClick={() => onNavigate?.(r.tab)}
                  className="flex items-center gap-0.5 self-start text-sm text-primary hover:underline"
                >
                  {r.action}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )
      })}
    </Box>
  )
}

// ─── Supporting charts ────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box className="flex flex-col gap-3 p-4">
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {children}
    </Box>
  )
}

// ─── Domains — popularity × coverage, one row per domain ──────────────────────
// How much a domain is asked about and how much of that uses ontology. Sorted by
// questions not using ontology (biggest gap first).

const formatK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`)

function DomainsChart() {
  const rows = [...DOMAIN_INVENTORY]
    .sort((a, b) => b.questions30d * (1 - b.groundedPct / 100) - a.questions30d * (1 - a.groundedPct / 100))
  const maxQ = Math.max(...rows.map((r) => r.questions30d))

  return (
    <div className="flex flex-col">
      {/* One bar per domain: length = questions asked (30d); dark = used ontology, light = didn't. Exact values on hover. */}
      <div className="flex items-center justify-between gap-4 pb-2 text-xs text-muted-foreground">
        <span>Questions (30d)</span>
        <span className="flex gap-3">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground/40" />Using ontology</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground/15" />Not using</span>
        </span>
      </div>
      {rows.map((r) => (
        <Tooltip key={r.domain}>
          <TooltipTrigger asChild>
            <div className="grid cursor-default grid-cols-[160px_1fr] items-center gap-4 border-t border-dashed border-muted-foreground/30 py-2 text-sm hover:bg-muted-foreground/5">
              <span className="flex items-center gap-1.5 truncate text-foreground">
                {domainName(r.domain)}
                {r.coverage === "gap" && <span className="text-muted-foreground" aria-label="Coverage gap">⚠</span>}
              </span>
              <span className="flex h-3 gap-0.5" style={{ width: `${(r.questions30d / maxQ) * 100}%` }}>
                <span className="h-full rounded-l-[3px] bg-muted-foreground/40" style={{ width: `${r.groundedPct}%` }} />
                <span className="h-full flex-1 rounded-r-[3px] bg-muted-foreground/15" />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="start">
            <div className="flex min-w-[240px] flex-col gap-1">
              <span className="font-semibold">{domainName(r.domain)}</span>
              <span>{r.groundedPct}% of {formatK(r.questions30d)} questions used ontology</span>
              {r.coverage === "gap" && r.coverageDetail && <span>Gap: {r.coverageDetail}</span>}
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export function UnifiedOverview({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
      <div className="flex min-w-0 flex-col gap-4">
        <StatusBand />
        {/* One domain view (replaces "Questions using ontology, by domain" + "Curators by domain"). */}
        <ChartCard title="Domains">
          <DomainsChart />
        </ChartCard>
        <ChartCard title="Top snippet sources">
          <SnippetSourcesChart onNavigate={onNavigate} />
        </ChartCard>
      </div>
      <div className="sticky top-0">
        <RecommendationsPanel onNavigate={onNavigate} />
      </div>
    </div>
  )
}
