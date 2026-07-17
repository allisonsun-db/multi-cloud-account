"use client"

import * as React from "react"

type SparklineTone = "success" | "warning" | "danger" | "muted"

const TONE_STROKE: Record<SparklineTone, string> = {
  success: "var(--trend-positive)",
  warning: "var(--trend-negative)",
  danger:  "var(--trend-negative)",
  muted:   "var(--muted-foreground)",
}

interface SparklineProps {
  data: number[]
  tone?: SparklineTone
  width?: number
  height?: number
  className?: string
}

/**
 * Minimal inline SVG sparkline — no dependencies.
 * Draws a compact, market-card style line plus a soft area fill.
 */
export function Sparkline({
  data,
  tone = "muted",
  width = 72,
  height = 24,
  className,
}: SparklineProps) {
  const gradId = React.useId()

  if (data.length < 2) return null

  const pad = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = (width - pad * 2) / (data.length - 1)

  const points = data.map((d, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (d - min) / range) * (height - pad * 2)
    return [x, y] as const
  })

  const line = points.reduce((path, [x, y], index) => {
    if (index === 0) return `M ${x} ${y}`

    return `${path} L ${x} ${y}`
  }, "")
  const area = `${line} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`
  const [lastX, lastY] = points[points.length - 1]
  const stroke = TONE_STROKE[tone]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="55%" stopColor={stroke} stopOpacity="0.09" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M ${pad} ${Math.round(height * 0.45)} H ${width - pad}`}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="1 8"
        className="text-border"
        opacity="0.65"
      />
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="1.75" fill={stroke} />
    </svg>
  )
}
