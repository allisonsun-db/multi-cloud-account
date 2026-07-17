"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { EllipsisVertical } from "lucide-react"
import { AppShell, useGenieCodePanel } from "@/components/shell"
import { GenieCommandBar } from "@/components/home/GenieCommandBar"
import { SetupChecklist } from "@/components/home/SetupChecklist"
import { Sparkline } from "@/components/home/Sparkline"
import { Meter, SegmentBar, StatusDots } from "@/components/home/CardVisual"
import { usePersona } from "@/components/home/usePersona"
import { setMaturity, useMaturity } from "@/components/home/useMaturity"
import { useCardCustomization } from "@/components/home/useCardCustomization"
import { PERSONA_CONFIGS, PERSONA_KEYS, type ChangeTone, type AlertLevel, type AttentionAlert, type OverviewCard, type QuickAction } from "@/components/home/personaConfigs"
import { Card, CardContent } from "@/components/ui/card"
import { DangerIcon, WarningIcon, DotsCircleIcon, ChevronRightIcon, LockIcon, DownloadIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CHANGE_TONE_CLASS: Record<ChangeTone, string> = {
  success: "text-[var(--trend-positive)]",
  warning: "text-[var(--trend-negative)]",
  danger:  "text-[var(--trend-negative)]",
  muted:   "text-muted-foreground",
}

const ALERT_ICON: Record<AlertLevel, React.ReactNode> = {
  urgent:  <DangerIcon     width={16} height={16} className="shrink-0 text-destructive" />,
  warning: <WarningIcon    width={16} height={16} className="shrink-0 text-[var(--warning)]" />,
  pending: <DotsCircleIcon width={16} height={16} className="shrink-0 text-muted-foreground" />,
}

const CUSTOMIZABLE_CARDS = PERSONA_KEYS
  .flatMap((key) => PERSONA_CONFIGS[key].cards)
  .filter((card, index, cards) => cards.findIndex((candidate) => candidate.label === card.label) === index)
const OVERVIEW_CARD_COUNT = 4

// Market-style random walks generated with a seeded PRNG so they're deterministic
// (stable across renders / SSR) but have realistic intraday texture: many fine ticks,
// small per-step noise that forms short runs before reversing, and a gentle trend
// envelope layered on top. `shape` bends the walk to match each tone.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildWalk(seed: number, shape: (t: number) => number, points = 64) {
  const rand = mulberry32(seed)
  let noise = 0
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    // Momentum-biased noise: small steps that persist for short runs, then mean-revert.
    noise += (rand() - 0.5) * 0.5 - noise * 0.08
    out.push(shape(t) + noise)
  }
  return out
}

const FALLBACK_SPARKLINES: Record<ChangeTone, number[]> = {
  // Noisy plateau low, then a sharp rally into the close (up)
  success: buildWalk(1337, (t) => 5.2 + Math.pow(t, 3) * 3.4),
  // Choppy grind lower with a mid-span relief bounce (down)
  warning: buildWalk(4242, (t) => 8.2 - t * 2.4 + Math.sin(t * Math.PI) * 0.5),
  // Sawtooth selloff, deepest near the end (down)
  danger:  buildWalk(9001, (t) => 8.6 - Math.pow(t, 1.3) * 3.6),
  // Erratic sideways chop, no net direction (neutral)
  muted:   buildWalk(2718, (t) => 7.4 + Math.sin(t * Math.PI * 2) * 0.25),
}

function getSparklineData(card: OverviewCard) {
  return card.spark ?? FALLBACK_SPARKLINES[card.changeTone ?? "muted"]
}

// Renders the card's purpose-fit micro-visual based on its declared `visual`.
// A sparkline implies time-series history, so it's reserved for "trend" metrics;
// scores/ratios use a meter, small health counts use status dots, and everything
// else (timestamps, point-in-time counts) shows no chart at all.
function getCardVisualSpacing(card: OverviewCard) {
  switch (card.visual) {
    case "trend":
      return "pt-2"
    case "meter":
      return "pt-6"
    case "segment":
    case "status":
      return "pt-7"
    default:
      return "pt-0"
  }
}

function renderCardVisual(card: OverviewCard) {
  switch (card.visual) {
    case "trend":
      return (
        <div className="-mx-3 -mb-[18px] h-12">
          <Sparkline
            data={getSparklineData(card)}
            tone={card.changeTone ?? "muted"}
            width={180}
            height={48}
            className="h-12 w-full"
          />
        </div>
      )
    case "meter":
      return card.meter ? (
        <Meter
          value={card.meter.value}
          max={card.meter.max}
          threshold={card.meter.threshold}
          tone={card.changeTone ?? "muted"}
        />
      ) : null
    case "segment":
      return card.segments ? <SegmentBar segments={card.segments} /> : null
    case "status":
      return card.status ? <StatusDots dots={card.status} /> : null
    default:
      return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <AppShell workspace="Nike Production" userInitial="A">
      <HomeContent />
    </AppShell>
  )
}

function HomeContent() {
  const router = useRouter()
  const { openGenieCode } = useGenieCodePanel()
  const persona = usePersona()
  const maturity = useMaturity()
  const cardCustomization = useCardCustomization()
  const { cards: overview, alerts, setup, readOnly, greeting, quickActions } = PERSONA_CONFIGS[persona]
  const [selectedCardLabels, setSelectedCardLabels] = React.useState<string[]>([])

  const cardsByLabel = React.useMemo(
    () => new Map(CUSTOMIZABLE_CARDS.map((card) => [card.label, card] as const)),
    [],
  )
  const roleCardOptions = React.useMemo(() => {
    const relevantHrefs = new Set(
      [
        ...overview.map((card) => card.href),
        ...alerts.map((alert) => alert.href),
        ...quickActions.map((action) => action.href),
      ].filter((href): href is string => Boolean(href))
    )

    const relevantCards = CUSTOMIZABLE_CARDS
      .filter((card) => overview.some((defaultCard) => defaultCard.label === card.label) || (card.href && relevantHrefs.has(card.href)))
    const defaultLabels = new Set(overview.map((card) => card.label))

    // Spend scoping: org scope shows org-wide spend and never account spend;
    // an account scope shows that account's spend and never org-wide spend.
    const scopedRelevantCards = persona === "org-admin"
      ? relevantCards.filter((card) => card.label !== "Account spend")
      : relevantCards.filter((card) => card.label !== "Org spend" && card.label !== "High-risk findings")
    const prioritizedCards = persona === "org-admin"
      ? [
        ...overview,
        ...scopedRelevantCards.filter((card) => card.label === "Active users"),
        ...scopedRelevantCards.filter((card) => card.label !== "Active users"),
      ]
      : persona === "account-admin"
        ? [
          ...overview,
          ...scopedRelevantCards.filter((card) => card.label === "New users"),
          ...scopedRelevantCards.filter((card) => card.label !== "New users"),
        ]
      : [
        ...overview,
        ...scopedRelevantCards,
      ]

    return prioritizedCards
      .filter((card, index, cards) => !defaultLabels.has(card.label) || cards.findIndex((candidate) => candidate.label === card.label) === index)
      .slice(0, 10)
  }, [alerts, overview, persona, quickActions])
  const fallbackCardLabels = React.useMemo(
    () => roleCardOptions.slice(0, OVERVIEW_CARD_COUNT).map((card) => card.label),
    [roleCardOptions],
  )
  const activeCardLabels = selectedCardLabels.length === OVERVIEW_CARD_COUNT ? selectedCardLabels : fallbackCardLabels
  const visibleOverview = activeCardLabels
    .map((label) => cardsByLabel.get(label))
    .filter((card): card is OverviewCard => Boolean(card))

  React.useEffect(() => {
    setSelectedCardLabels(fallbackCardLabels)
  }, [fallbackCardLabels])

  function setCardSlot(index: number, label: string) {
    const next = [...activeCardLabels]
    next[index] = label
    setSelectedCardLabels(next)
  }

  function handleReviewClick(alert: AttentionAlert) {
    openGenieCode({
      input: [
        "Help me review this account issue and suggest next actions.",
        "",
        `Issue: ${alert.text}`,
        `Severity: ${alert.level}`,
        `Source: ${alert.source}`,
        "Account: Nike Production",
      ].join("\n"),
      tags: [
        { id: `review-${alert.id}`, label: "Review item", kind: "node" },
      ],
      autoSubmit: true,
    })
  }

  function handleQuickActionClick(action: QuickAction) {
    openGenieCode({
      input: [
        `Help me ${action.label.toLowerCase()}.`,
        `Role: ${PERSONA_CONFIGS[persona].label}`,
        `Target area: ${action.href}`,
        "Account: Nike Production",
      ].join("\n"),
      tags: [
        { id: `quick-action-${action.id}`, label: action.label, kind: "node" },
      ],
      autoSubmit: true,
    })
  }

  const reviewHref = alerts[0]?.href ?? "/security"

  return (
      <div className="mx-auto mt-4 flex w-full max-w-[800px] flex-col gap-10 p-6 pt-20 md:pt-24 lg:pt-28">

        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <h1 className="text-center text-[24px] font-semibold text-foreground">
            {greeting}
          </h1>

          {/* Genie command bar */}
          <GenieCommandBar />

          {/* Overview cards (persona-aware) */}
          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
            {visibleOverview.map((m, index) => (
              <Card
                key={`${index}-${m.label}`}
                className={`group/card relative overflow-hidden border-transparent bg-secondary py-0 shadow-none transition-[background-color,border-color,box-shadow,transform] dark:bg-card ${m.href ? "cursor-pointer hover:border-border hover:bg-muted/60 hover:shadow-[var(--shadow-db-sm)] active:scale-[0.995] active:bg-muted/70 dark:hover:bg-muted/30 dark:active:bg-muted/40" : ""}`}
                onClick={() => {
                  if (m.href) router.push(m.href)
                }}
              >
                {cardCustomization && (
                  <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover/card:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Customize ${m.label} card`}
                          className="text-muted-foreground hover:bg-background/80 hover:text-foreground"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <EllipsisVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[220px]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
                          Replace widget
                        </DropdownMenuLabel>
                        {roleCardOptions.filter((card) => !activeCardLabels.includes(card.label)).map((card) => (
                          <DropdownMenuItem
                            key={card.label}
                            onClick={(event) => {
                              event.stopPropagation()
                              setCardSlot(index, card.label)
                            }}
                            className={card.label === m.label ? "font-semibold text-accent-foreground" : undefined}
                          >
                            {card.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <CardContent className="flex min-h-[132px] flex-col px-4 pb-4 pt-4">
                  <div className="truncate text-sm font-semibold text-foreground">{m.label}</div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-[18px] font-semibold text-foreground">{m.value}</span>
                    {m.change && (
                      <span className={`flex items-center gap-1 text-xs font-normal ${CHANGE_TONE_CLASS[m.changeTone ?? "muted"]}`}>
                        {m.change}
                      </span>
                    )}
                  </div>
                  <div className={getCardVisualSpacing(m)}>{renderCardVisual(m)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Review + Getting started (side by side) ───────────────────── */}
        <div className="grid grid-cols-1 gap-7 min-[820px]:grid-cols-[minmax(0,1.55fr)_minmax(220px,0.75fr)]">

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-foreground">Review</h2>
                {readOnly && (
                  <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    <LockIcon width={12} height={12} className="shrink-0" />
                    Read-only
                  </span>
                )}
              </div>
              <button
                type="button"
                className="pr-4 text-xs text-muted-foreground hover:text-accent-foreground"
                onClick={() => router.push(reviewHref)}
              >
                View all
              </button>
            </div>
            <div className="rounded-md border border-border">
              {alerts.map((alert, i) => {
                const divider = i < alerts.length - 1
                  ? "relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-border"
                  : ""
                const rowClass = `flex w-full items-center gap-3 px-4 py-2.5 text-left ${divider}`

                // Read-only roles: view-only rows, no fix action, no chevron.
                if (readOnly) {
                  return (
                    <div key={alert.id} className={rowClass}>
                      {ALERT_ICON[alert.level]}
                      <span className="flex-1 text-sm text-foreground">{alert.text}</span>
                    </div>
                  )
                }

                return (
                  <button
                    type="button"
                    key={alert.id}
                    className={`${rowClass} hover:bg-muted/50`}
                    onClick={() => handleReviewClick(alert)}
                  >
                    {ALERT_ICON[alert.level]}
                    <span className="flex-1 text-sm text-foreground">{alert.text}</span>
                    <ChevronRightIcon width={18} height={18} className="shrink-0 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          </section>

          {readOnly ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-[15px] font-semibold text-foreground">Audit export</h2>
              <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Export a point-in-time snapshot of settings, effective permissions,
                  and configuration across all workspaces in scope for compliance review.
                </p>
                <Button variant="outline" size="sm" className="self-start">
                  <DownloadIcon width={16} height={16} className="mr-1.5" />
                  Export audit report
                </Button>
              </div>
            </section>
          ) : maturity === "new" ? (
            <SetupChecklist steps={setup} onHide={() => setMaturity("established")} />
          ) : (
            <section className="flex flex-col gap-3">
              <h2 className="text-[15px] font-semibold text-foreground">Quick actions</h2>
              <div className="flex flex-col gap-2">
                {quickActions.map((action) => (
                  <button
                    type="button"
                    key={action.id}
                    className="inline-flex h-8 w-fit items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => handleQuickActionClick(action)}
                  >
                    <action.icon width={16} height={16} className="shrink-0 text-muted-foreground" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

        </div>

      </div>
  )
}
