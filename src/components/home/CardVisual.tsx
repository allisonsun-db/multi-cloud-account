"use client"

import * as React from "react"
import type { ChangeTone } from "@/components/home/personaConfigs"

// Shared tone → color map for the non-trend card visuals. Mirrors the sparkline
// tones so a card's micro-visual matches its change label color.
const TONE_COLOR: Record<ChangeTone, string> = {
  success: "var(--trend-positive)",
  warning: "var(--warning)",
  danger:  "var(--trend-negative)",
  muted:   "var(--muted-foreground)",
}

// Extra severity colors for the segmented breakdown bar. `high` reuses the danger
// red, `medium` the warning orange, `low` a lighter amber, `passed` the success green.
const SEGMENT_COLOR = {
  passed: "var(--trend-positive)",
  high:   "var(--trend-negative)",
  medium: "var(--warning)",
  low:    "var(--color-lemon-500)",
} as const

export type SegmentKind = keyof typeof SEGMENT_COLOR

// ─── Meter ──────────────────────────────────────────────────────────────────
// A filled track showing a value as a fraction of a max — the right shape for
// scores (92/100), ratios (18/20), and percentages (75%). An optional threshold
// marker shows a limit the value can spill past (e.g. forecast over budget).

interface MeterProps {
  value: number
  max: number
  tone?: ChangeTone
  /** Position of a limit marker, in the same units as `value` (e.g. the budget). */
  threshold?: number
  className?: string
}

export function Meter({ value, max, tone = "muted", threshold, className }: MeterProps) {
  const color = TONE_COLOR[tone]
  // Clamp the visible fill to the track; over-max values (110%) read as "full + over".
  const pct = Math.max(0, Math.min(1, value / max))
  const thresholdPct = threshold != null ? Math.max(0, Math.min(1, threshold / max)) : null

  return (
    <div className={className}>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
        {thresholdPct != null && (
          <span
            className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-foreground/70"
            style={{ left: `${thresholdPct * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}

// ─── SegmentBar ───────────────────────────────────────────────────────────────
// A proportional stacked bar with small gaps between segments — the right shape
// for a breakdown that sums to a whole, e.g. a security posture split into passed
// vs. high / medium / low severity findings.

export interface Segment {
  kind: SegmentKind
  value: number
  label?: string
}

interface SegmentBarProps {
  segments: Segment[]
  className?: string
}

export function SegmentBar({ segments, className }: SegmentBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1

  return (
    <div className={`flex h-2 w-full items-stretch gap-0.5 ${className ?? ""}`}>
      {segments.map((seg, i) => (
        <span
          key={i}
          className="h-full rounded-[1px]"
          style={{
            width: `${(seg.value / total) * 100}%`,
            backgroundColor: SEGMENT_COLOR[seg.kind],
          }}
          title={seg.label}
          aria-label={seg.label}
        />
      ))}
    </div>
  )
}

// ─── StatusDots ───────────────────────────────────────────────────────────────
// A compact row of dots for small counts where health/state matters more than
// magnitude — "4 accounts, all healthy" or "1 resource needs attention".

export interface StatusDot {
  tone: ChangeTone
  label?: string
}

interface StatusDotsProps {
  dots: StatusDot[]
  className?: string
}

export function StatusDots({ dots, className }: StatusDotsProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      {dots.map((dot, i) => (
        <span
          key={i}
          className="size-2 rounded-full"
          style={{ backgroundColor: TONE_COLOR[dot.tone] }}
          title={dot.label}
          aria-label={dot.label}
        />
      ))}
    </div>
  )
}
