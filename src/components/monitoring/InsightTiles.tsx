"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/home/Sparkline"
import { Meter, SegmentBar, StatusDots } from "@/components/home/CardVisual"
import type { ChangeTone, OverviewCard } from "@/components/home/personaConfigs"

// Monitoring insight tiles — the read-only "how is this topic doing" band that stacks
// above a management surface on a unified topic page (see src/app/e/*). Mirrors the
// home page's overview-card anatomy (label / value+change / micro-visual) and reuses
// the same OverviewCard model and visuals, minus the home-only customization dropdown.

const CHANGE_TONE_CLASS: Record<ChangeTone, string> = {
  success: "text-[var(--trend-positive)]",
  warning: "text-[var(--trend-negative)]",
  danger:  "text-[var(--trend-negative)]",
  muted:   "text-muted-foreground",
}

const FALLBACK_TREND: Record<ChangeTone, number[]> = {
  success: [5.4, 5.2, 5.6, 5.5, 5.9, 5.8, 6.3, 6.1, 6.7, 6.5, 7.1, 7.4],
  warning: [7.8, 7.9, 7.6, 7.7, 7.4, 7.5, 7.2, 7.3, 7.0, 7.1, 6.8, 6.6],
  danger:  [8.2, 8.0, 8.1, 7.7, 7.8, 7.3, 7.4, 6.9, 7.0, 6.5, 6.2, 5.9],
  muted:   [7.0, 7.2, 7.1, 7.3, 7.1, 7.2, 7.0, 7.2, 7.1, 7.3, 7.1, 7.2],
}

function renderVisual(card: OverviewCard) {
  const tone = card.changeTone ?? "muted"
  switch (card.visual) {
    case "trend":
      return (
        <div className="-mx-4 -mb-4 h-12">
          <Sparkline
            data={card.spark ?? FALLBACK_TREND[tone]}
            tone={tone}
            width={180}
            height={48}
            className="h-12 w-full"
          />
        </div>
      )
    case "meter":
      return card.meter ? (
        <Meter value={card.meter.value} max={card.meter.max} threshold={card.meter.threshold} tone={tone} />
      ) : null
    case "segment":
      return card.segments ? <SegmentBar segments={card.segments} /> : null
    case "status":
      return card.status ? <StatusDots dots={card.status} /> : null
    default:
      return null
  }
}

interface InsightTilesProps {
  cards: OverviewCard[]
  className?: string
}

export function InsightTiles({ cards, className }: InsightTilesProps) {
  const router = useRouter()

  return (
    <div className={`grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4 ${className ?? ""}`}>
      {cards.map((card, index) => (
        <Card
          key={`${index}-${card.label}`}
          className={`group/card relative overflow-hidden border-transparent bg-secondary py-0 shadow-none transition-[background-color,border-color,box-shadow,transform] dark:bg-card ${card.href ? "cursor-pointer hover:border-border hover:bg-muted/60 hover:shadow-[var(--shadow-db-sm)] active:scale-[0.995] active:bg-muted/70 dark:hover:bg-muted/30 dark:active:bg-muted/40" : ""}`}
          onClick={() => {
            if (card.href) router.push(card.href)
          }}
        >
          <CardContent className="flex min-h-[132px] flex-col px-4 pb-4 pt-4">
            <div className="truncate text-sm font-semibold text-foreground">{card.label}</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-[18px] leading-6 font-semibold text-foreground">{card.value}</span>
              {card.change && (
                <span className={`flex items-center gap-1 text-xs font-normal ${CHANGE_TONE_CLASS[card.changeTone ?? "muted"]}`}>
                  {card.change}
                </span>
              )}
            </div>
            {card.caption && card.visual !== "trend" && (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{card.caption}</div>
            )}
            <div className={card.visual === "trend" ? "mt-auto pt-2" : "mt-auto pt-7"}>{renderVisual(card)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
