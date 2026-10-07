"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircleIcon, WarningIcon } from "@/components/icons"
import { scaleSeries } from "@/lib/scope-data"
import { ChevronRight } from "lucide-react"
import { Sparkline } from "@/components/home/Sparkline"
import { CardTitle } from "./shared"
import { COVERAGE, CONNECTION_TYPES, ConnectionStatus, connectionSummary, scopedObjects } from "./inventory"
import {
  ACCOUNT_ANSWER_SEC, BLOCKED_USERS, CONTRIBUTORS, DOMAINS, DOMAIN_INVENTORY, DOMAIN_TOPICS, GENIE_USERS,
  INITIAL_GRANTS, SNIPPET_SOURCE_SHARES, ZERO_RESULT_RATE, domainName,
} from "./data"

// Overview — three parallel sections (Impact · Inventory · Access). Each is a header
// with the question it answers, three large KPIs (number + one caption), then two
// visualizations that explain the KPIs above them.

function formatK(v: number) {
  if (v >= 100_000) return `${Math.round(v / 1000)}K`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return `${Math.round(v)}`
}

// ─── Section anatomy ───────────────────────────────────────────────────────────

function OverviewSection({
  title,
  question,
  link,
  children,
}: {
  title: string
  question: string
  link?: { label: string; onClick: () => void }
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[18px] leading-6 font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{question}</p>
        </div>
        {link && (
          <button type="button" onClick={link.onClick} className="flex shrink-0 items-center gap-0.5 text-sm text-primary hover:underline">
            {link.label}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

// Large KPI: label, big number, one caption line. No charts — those live in the
// visualization row below.
function Kpi({
  label,
  tooltip,
  value,
  caption,
  spark,
  sparkTone = "success",
}: {
  label: string
  tooltip?: React.ReactNode
  value: string
  caption: React.ReactNode
  /** Optional inline trend — used instead of a separate chart of the same metric. */
  spark?: number[]
  sparkTone?: "success" | "danger"
}) {
  return (
    <Card className="h-full py-0 shadow-none">
      <CardContent className="flex h-full flex-col gap-1 p-4">
        <CardTitle tooltip={tooltip}>{label}</CardTitle>
        <div className="flex items-end gap-3">
          <div className="text-[28px] leading-9 font-semibold text-foreground">{value}</div>
          {spark && <Sparkline data={spark} tone={sparkTone} width={88} height={28} className="mb-1 shrink-0" />}
        </div>
        <div className="text-sm text-muted-foreground">{caption}</div>
      </CardContent>
    </Card>
  )
}

function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
}

function VizRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
}

// Visualization card: a title (plus optional legend/descriptor on the right) and the
// chart. No headline value — the KPI above already states it — and no footer button:
// the section header links to the detail tab.
function VizCard({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="h-full py-0 shadow-none">
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

// One row pattern for every bar list (matches the wireframe): label on the left, a
// thick rounded bar, value on the right — one line per row. `fraction` is bar length
// (0–1); `filled` (0–1) optionally splits it two-tone.
function BarRow({
  label,
  meta,
  value,
  fraction,
  filled,
  onClick,
  title,
}: {
  label: string
  meta?: React.ReactNode
  value: React.ReactNode
  fraction: number
  filled?: number
  onClick?: () => void
  title?: string
}) {
  const Row = onClick ? "button" : "div"
  return (
    <Row
      {...(onClick ? { type: "button" as const, onClick } : {})}
      title={title}
      // relative: contains the sr-only status labels — without it they position against
      // the page and stretch it below the app shell, leaving blank space at the bottom.
      className="group relative flex w-full items-center gap-3 text-left text-sm"
    >
      <span className="flex w-[148px] shrink-0 items-center gap-1.5">
        <span className={`truncate text-foreground ${onClick ? "group-hover:underline" : ""}`}>{label}</span>
        {meta}
      </span>
      <span className="min-w-0 flex-1">
        {/* A zero value draws no bar (no misleading sliver); small non-zero values get a 2% floor. */}
        <span className="flex h-3 gap-0.5" style={{ width: fraction === 0 ? 0 : `${Math.max(fraction * 100, 2)}%` }} aria-hidden="true">
          {filled === undefined ? (
            <span className="h-full flex-1 rounded-full bg-primary" />
          ) : (
            <>
              <span className="h-full rounded-l-full bg-primary" style={{ width: `${filled * 100}%` }} />
              <span className="h-full flex-1 rounded-r-full bg-[var(--chart-bar)]" />
            </>
          )}
        </span>
      </span>
      <span className="min-w-[56px] shrink-0 text-right tabular-nums text-foreground">{value}</span>
    </Row>
  )
}

function BarList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2.5">{children}</div>
}

const LegendDot = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1"><span className={`size-2 rounded-full ${className}`} />{children}</span>
)

// ─── Overview tab ──────────────────────────────────────────────────────────────

export function OverviewTab({
  domain,
  onNavigate,
  onDomainChange,
}: {
  domain: string
  onNavigate: (tab: string) => void
  onDomainChange: (domain: string) => void
}) {
  // Impact — grounded % derives from DOMAIN_INVENTORY so it matches the coverage bars.
  const rows = domain === "all" ? DOMAIN_INVENTORY : DOMAIN_INVENTORY.filter((d) => d.domain === domain)
  const asked = rows.reduce((sum, r) => sum + r.questions30d, 0)
  const grounded = rows.reduce((sum, r) => sum + r.questions30d * (r.groundedPct / 100), 0)
  const groundedPct = asked ? Math.round((grounded / asked) * 100) : 0
  const times = domain === "all" ? ACCOUNT_ANSWER_SEC : rows[0]?.answerSec ?? ACCOUNT_ANSWER_SEC

  const zeroRate = React.useMemo(
    () => (domain === "all" ? ZERO_RESULT_RATE : scaleSeries(ZERO_RESULT_RATE, domain).map((v) => Math.min(v * 2.2, 40))),
    [domain],
  )
  const zeroNow = zeroRate[zeroRate.length - 1]
  const zeroDelta = zeroNow - zeroRate[0]

  // Inventory — connection counts derive from INITIAL_SOURCES so they match the Sources tab.
  const objects = React.useMemo(() => scopedObjects(domain), [domain])
  const assetsTotal = objects.reduce((sum, o) => sum + o.total, 0)
  const sourceAssets = objects.find((o) => o.kind === "snippets")?.sourceAssets ?? 0
  const connections = CONNECTION_TYPES.map((c) => ({ ...c, ...connectionSummary(c.channel) }))
  const connectedTotal = connections.reduce((sum, c) => sum + c.connected, 0)
  const attentionTotal = connections.reduce((sum, c) => sum + c.attention, 0)
  // Snippet sources: top four types + "Other" (long tail incl. Power BI at 0.03%).
  const sortedSources = [...SNIPPET_SOURCE_SHARES].sort((a, b) => b.sharePct - a.sharePct)
  const sourceRows = [
    ...sortedSources.slice(0, 4).map((t) => ({ name: t.type, sharePct: t.sharePct, title: undefined as string | undefined })),
    {
      name: "Other",
      sharePct: sortedSources.slice(4).reduce((sum, t) => sum + t.sharePct, 0),
      title: sortedSources.slice(4).map((t) => `${t.type}${t.thirdParty ? " (3rd-party)" : ""}`).join(" · "),
    },
  ]

  // Coverage: biggest ungrounded volume first.
  const coverage = [...DOMAIN_INVENTORY].sort(
    (a, b) => b.questions30d * (1 - b.groundedPct / 100) - a.questions30d * (1 - a.groundedPct / 100),
  )
  const maxAsked = Math.max(...coverage.map((d) => d.questions30d))
  const topics = [...(DOMAIN_TOPICS[domain] ?? [])].sort((a, b) => b.questions - a.questions)

  // Access
  const accountCurators = INITIAL_GRANTS.filter((g) => g.scope === "account").length
  const domainCurators = INITIAL_GRANTS.length - accountCurators
  const uncurated = DOMAINS.filter((d) => !INITIAL_GRANTS.some((g) => g.scope !== "account" && g.scope.includes(d.id)))
  const blocked = BLOCKED_USERS
    .filter((u) => domain === "all" || u.domain === domain)
    .sort((a, b) => b.noAccessAnswers - a.noAccessAnswers)
  const genieUsers = GENIE_USERS[domain] ?? GENIE_USERS.all
  const curatorsByDomain = DOMAINS
    .map((d) => ({ ...d, count: INITIAL_GRANTS.filter((g) => g.scope !== "account" && g.scope.includes(d.id)).length }))
    .sort((a, b) => a.count - b.count)
  const maxCurators = Math.max(...curatorsByDomain.map((d) => d.count), 1)
  const contributors = CONTRIBUTORS
    .filter((c) => domain === "all" || c.domains.includes(domain))
    .map((c) => ({ id: c.id, name: c.name, total: c.pages + c.snippets + c.tables }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-10">
      {/* ── Impact ───────────────────────────────────────────────────────────── */}
      <OverviewSection title="Impact" question="Is the ontology improving Genie?">
        <KpiRow>
          <Kpi
            label="Questions using ontology"
            tooltip="Share of Genie questions in the last 30 days answered using ontology knowledge."
            value={`${groundedPct}%`}
            caption={`${formatK(grounded)} of ${formatK(asked)} questions`}
          />
          <Kpi
            label="Answer time"
            tooltip="Median time to answer a question over the last 30 days, with vs. without ontology."
            value={`${(times.ungrounded / times.grounded).toFixed(1)}× faster`}
            caption={`${times.grounded.toFixed(1)}s with ontology vs. ${times.ungrounded.toFixed(1)}s without`}
          />
          <Kpi
            label="Zero-result searches"
            tooltip="Share of searches that returned no results, last 12 weeks."
            value={`${zeroNow.toFixed(1)}%`}
            spark={zeroRate}
            sparkTone={zeroDelta <= 0 ? "success" : "danger"}
            caption={
              <>
                <span className={zeroDelta <= 0 ? "text-[var(--success)]" : "text-destructive"}>
                  {zeroDelta <= 0 ? "" : "+"}{zeroDelta.toFixed(1)} pts
                </span>{" "}
                vs. 12 weeks ago
              </>
            }
          />
        </KpiRow>
        <div className="grid grid-cols-1 gap-4">
          {domain === "all" ? (
            <VizCard
              title="Questions using ontology, by domain (30d)"
              aside={<span className="flex gap-3"><LegendDot className="bg-primary">Using ontology</LegendDot><LegendDot className="bg-[var(--chart-bar)]">Not using</LegendDot></span>}
            >
              <BarList>
                {coverage.map((d) => (
                  <BarRow
                    key={d.domain}
                    label={domainName(d.domain)}
                    // Only coverage gaps here; "no curator" is counted in the Access section.
                    meta={d.coverage === "gap" && (
                      <span className="flex shrink-0 items-center" title={COVERAGE[d.coverage].label}>
                        {COVERAGE[d.coverage].icon}
                        <span className="sr-only">{COVERAGE[d.coverage].label}</span>
                      </span>
                    )}
                    value={<span className="font-semibold">{d.groundedPct}%</span>}
                    fraction={d.questions30d / maxAsked}
                    filled={d.groundedPct / 100}
                    onClick={() => onDomainChange(d.domain)}
                    title={`${d.groundedPct}% of ${formatK(d.questions30d)} questions grounded${d.coverage === "gap" && d.coverageDetail ? ` · Gap — ${d.coverageDetail}` : ""}`}
                  />
                ))}
              </BarList>
            </VizCard>
          ) : (
            <VizCard title="Top questions (30d)" aside="Curated in ontology?">
              <BarList>
                {topics.map((t) => (
                  <BarRow
                    key={t.topic}
                    label={t.topic}
                    meta={
                      <span className="flex shrink-0 items-center" title={t.curated ? "Curated" : "Not curated"}>
                        {t.curated ? <CheckCircleIcon size={12} className="text-[var(--success)]" /> : <WarningIcon size={12} className="text-[var(--warning)]" />}
                        <span className="sr-only">{t.curated ? "Curated" : "Not curated"}</span>
                      </span>
                    }
                    value={t.questions}
                    fraction={t.questions / Math.max(...topics.map((x) => x.questions), 1)}
                  />
                ))}
              </BarList>
            </VizCard>
          )}
        </div>
      </OverviewSection>

      {/* ── Inventory ────────────────────────────────────────────────────────── */}
      <OverviewSection
        title="Inventory"
        question="What does Genie know, and what feeds it?"
        link={{ label: "View sources & connectors", onClick: () => onNavigate("sources") }}
      >
        <KpiRow>
          <Kpi
            label="Ontology assets"
            value={formatK(assetsTotal)}
            caption={objects.map((o) => `${o.total.toLocaleString()} ${o.label.toLowerCase()}`).join(" · ")}
          />
          <Kpi
            label="Snippet sources"
            tooltip="Source assets Genie harvests snippets from. Many assets can feed one snippet."
            value={formatK(sourceAssets)}
            caption="Source assets harvested"
          />
          <Kpi
            label="Connections"
            value={`${connectedTotal}`}
            caption={
              attentionTotal > 0 ? (
                <span className="flex items-center gap-1 text-foreground">
                  <WarningIcon size={14} className="shrink-0 text-[var(--warning)]" />
                  {attentionTotal} need attention
                </span>
              ) : (
                "All healthy"
              )
            }
          />
        </KpiRow>
        <VizRow>
          <VizCard title="Snippet sources by type" aside="Source assets">
            <BarList>
              {sourceRows.map((r) => (
                <BarRow
                  key={r.name}
                  label={r.name}
                  value={<><span className="font-semibold">{formatK(Math.round((sourceAssets * r.sharePct) / 100))}</span> <span className="text-muted-foreground">{Math.round(r.sharePct)}%</span></>}
                  fraction={r.sharePct / sourceRows[0].sharePct}
                  title={r.title}
                />
              ))}
            </BarList>
          </VizCard>
          <VizCard title="Connection health" aside="Status">
            <div className="flex flex-col">
              {connections.map((c) => (
                <div key={c.channel} className="flex items-center justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-0" title={c.title}>
                  <span className="text-sm text-foreground">
                    {c.label} <span className="text-muted-foreground">· {c.connected}</span>
                  </span>
                  <ConnectionStatus channel={c.channel} />
                </div>
              ))}
            </div>
          </VizCard>
        </VizRow>
      </OverviewSection>

      {/* ── Access ───────────────────────────────────────────────────────────── */}
      <OverviewSection
        title="Access"
        question="Who shapes the ontology, and who's blocked?"
        link={{ label: "View governance & access", onClick: () => onNavigate("governance") }}
      >
        <KpiRow>
          <Kpi
            label="Curators"
            tooltip="People with Manage Discovery, who can curate the ontology."
            value={`${INITIAL_GRANTS.length}`}
            caption={`${accountCurators} account-level · ${domainCurators} domain-level`}
          />
          <Kpi
            label="Domains without a curator"
            value={`${uncurated.length}`}
            caption={`of ${DOMAINS.length} domains`}
          />
          <Kpi
            label="Users missing data access"
            tooltip="Active Genie users in the last 30 days who can't read the data their questions need."
            value={`${blocked.length}`}
            caption={`of ${genieUsers.toLocaleString()} Genie users`}
          />
        </KpiRow>
        <VizRow>
          <VizCard title="Top contributors" aside="Contributions">
            <BarList>
              {contributors.map((c) => (
                <BarRow key={c.id} label={c.name} value={<span className="font-semibold">{c.total.toLocaleString()}</span>} fraction={c.total / contributors[0].total} />
              ))}
            </BarList>
          </VizCard>
          <VizCard title="Curators by domain" aside="Domain-level curators">
            <BarList>
              {curatorsByDomain.map((d) => (
                <BarRow
                  key={d.id}
                  label={d.name}
                  meta={d.count === 0 && (
                    <span className="flex shrink-0 items-center" title="No curator">
                      {COVERAGE["no-curator"].icon}
                      <span className="sr-only">No curator</span>
                    </span>
                  )}
                  value={d.count === 0 ? <span className="text-muted-foreground">None</span> : <span className="font-semibold">{d.count}</span>}
                  fraction={d.count / maxCurators}
                  title={d.count === 0 ? "No domain-level curator — gaps can't be routed to a domain expert" : `${d.count} domain-level curator${d.count === 1 ? "" : "s"}`}
                />
              ))}
            </BarList>
          </VizCard>
        </VizRow>
      </OverviewSection>
    </div>
  )
}
