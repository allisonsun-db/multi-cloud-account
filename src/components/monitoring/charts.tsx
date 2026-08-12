"use client"

import * as React from "react"

// Minimal inline-SVG chart primitives — no chart library, same spirit as
// src/components/home/Sparkline.tsx. Colored with DuBois tokens (globals.css),
// following the dataviz mark specs: thin marks, rounded data-ends, recessive axes.

// ─── BarChart ─────────────────────────────────────────────────────────────────
// A single-series vertical bar chart (e.g. daily query volume). One series, so no
// legend; faint y gridlines with min/mid/max labels and sparse x date ticks.

interface BarChartProps {
  data: number[]
  /** Optional x-axis tick labels, placed at evenly spaced positions. */
  xLabels?: { at: number; label: string }[]
  height?: number
  className?: string
  /** Formats the y-axis max/mid labels (e.g. millions → "3M"). */
  formatY?: (value: number) => string
  /** Pixel gap between bars. Larger values render thinner bars. */
  gap?: number
}

export function BarChart({ data, xLabels = [], height = 180, className, formatY = (v) => `${v}`, gap = 2 }: BarChartProps) {
  const max = Math.max(...data, 1)

  return (
    <div className={className}>
      <div className="flex gap-2">
        {/* Y axis labels */}
        <div
          className="flex w-8 shrink-0 flex-col justify-between text-right text-[10px] leading-none text-muted-foreground"
          style={{ height }}
        >
          <span>{formatY(max)}</span>
          <span>{formatY(max / 2)}</span>
          <span>0</span>
        </div>

        {/* Plot */}
        <div className="relative min-w-0 flex-1" style={{ height }}>
          {/* Gridlines */}
          {[0, 0.5, 1].map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-border"
              style={{ top: `${t * 100}%` }}
              aria-hidden="true"
            />
          ))}
          {/* Bars */}
          <div className="absolute inset-0 flex items-end" style={{ gap }}>
            {data.map((d, i) => (
              <div
                key={i}
                className="min-w-0 flex-1 rounded-t-[3px] bg-[var(--color-blue-400)] transition-[height]"
                style={{ height: `${Math.max((d / max) * 100, 1)}%` }}
                title={formatY(d)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* X axis labels */}
      {xLabels.length > 0 && (
        <div className="relative ml-10 mt-1.5 h-3 text-[10px] leading-none text-muted-foreground">
          {xLabels.map((tick) => (
            <span
              key={tick.at}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${(tick.at / (data.length - 1)) * 100}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Donut ──────────────────────────────────────────────────────────────────
// A proportional ring for a breakdown that sums to a whole (grants by level).
// Single-hue sequential ramp by magnitude (not categorical); legend beside it
// carries identity, with text in ink tokens rather than the slice color.

export interface DonutSlice {
  label: string
  value: number
  color: string
}

interface DonutProps {
  slices: DonutSlice[]
  size?: number
  thickness?: number
  className?: string
  /** Formats each legend value (e.g. → "95.7%"). */
  formatValue?: (value: number, total: number) => string
  /** Render only the ring — the caller supplies its own legend. */
  hideLegend?: boolean
}

export function Donut({ slices, size = 132, thickness = 20, className, formatValue, hideLegend }: DonutProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const gapDeg = 2 // small surface gap between slices

  // Cumulative sweep before each slice, so we don't mutate an accumulator mid-map.
  const arcs = slices.map((slice, i) => {
    const priorSweep = slices.slice(0, i).reduce((sum, s) => sum + (s.value / total) * 360, 0)
    const sweep = (slice.value / total) * 360
    return {
      color: slice.color,
      dashLen: (Math.max(sweep - gapDeg, 0) / 360) * circumference,
      rotation: -90 + priorSweep, // start at 12 o'clock
    }
  })

  const pct = (v: number) => (formatValue ? formatValue(v, total) : `${((v / total) * 100).toFixed(1)}%`)

  const ring = (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-hidden="true">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--muted)" strokeWidth={thickness} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={thickness}
          strokeDasharray={`${arc.dashLen} ${circumference - arc.dashLen}`}
          strokeDashoffset={0}
          transform={`rotate(${arc.rotation} ${center} ${center})`}
        />
      ))}
    </svg>
  )

  if (hideLegend) return ring

  return (
    <div className={`flex items-center gap-4 ${className ?? ""}`}>
      {ring}

      {/* Legend */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>Grants by level</span>
          <span className="shrink-0">Assign %</span>
        </div>
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: slice.color }} />
              <span className="truncate text-foreground">{slice.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-foreground">{pct(slice.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
