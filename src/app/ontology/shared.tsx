"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/home/Sparkline"
import { CheckCircleIcon, ChevronRightIcon, SyncIcon, WarningIcon } from "@/components/icons"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { SourceStatus } from "./data"

// Card anatomy shared with the other unified monitoring pages (/cost, /e/security,
// /ai): Info-icon title, 18px headline value, optional delta, full-width footer link.

export function CardTitle({ children, tooltip, info = true }: { children: React.ReactNode; tooltip?: React.ReactNode; info?: boolean }) {
  const icon = <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-foreground">{children}</span>
      {!info ? null : tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="More info" className="inline-flex">{icon}</button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{tooltip}</TooltipContent>
        </Tooltip>
      ) : icon}
    </div>
  )
}

export function CardValue({ children }: { children: React.ReactNode }) {
  return <div className="text-[18px] leading-6 font-semibold text-foreground">{children}</div>
}

export function CardFooterLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-auto flex h-8 w-full items-center justify-center gap-1 rounded border border-border text-sm text-foreground transition-colors hover:bg-muted"
    >
      {label}
      <ChevronRightIcon className="h-3.5 w-3.5" />
    </button>
  )
}

export function MonitorCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("py-0 shadow-none", className)}>
      <CardContent className="flex h-full flex-col gap-3 p-4">{children}</CardContent>
    </Card>
  )
}

// Stat card: label + value, plus optional caption and "+x vs. previous" delta.
export function StatCard({
  label,
  value,
  caption,
  delta,
  deltaTone = "neutral",
  deltaSuffix = "vs. previous",
  spark,
  visual,
  info = true,
}: {
  info?: boolean
  label: string
  value: string
  caption?: React.ReactNode
  delta?: string
  deltaTone?: "success" | "danger" | "neutral"
  deltaSuffix?: string
  /** Optional trend sparkline beside the value. */
  spark?: number[]
  /** Optional visual pinned to the bottom of the card (e.g. a share bar). */
  visual?: React.ReactNode
}) {
  return (
    <Card className="h-full py-0 shadow-none">
      <CardContent className="flex h-full flex-col gap-1 p-4">
        <CardTitle info={info}>{label}</CardTitle>
        <div className="flex items-end gap-3">
          <CardValue>{value}</CardValue>
          {spark && <Sparkline data={spark} tone="success" width={72} height={24} className="shrink-0" />}
        </div>
        {caption && <div className="text-sm text-muted-foreground">{caption}</div>}
        {delta && (
          <div className="text-sm text-foreground">
            <span className={cn(deltaTone === "success" && "text-[var(--success)]", deltaTone === "danger" && "text-destructive")}>
              {delta}
            </span>{" "}
            <span className="text-muted-foreground">{deltaSuffix}</span>
          </div>
        )}
        {visual && <div className="mt-auto pt-2">{visual}</div>}
      </CardContent>
    </Card>
  )
}

// Ranked horizontal-bar list — name inside the bar, value right-aligned. Bar width is
// proportional to the max in the set (same as /cost and /ai).
export function RankedBarList({
  columns,
  rows,
  onSelect,
  icon: Icon,
}: {
  columns: [string, string]
  rows: { id: string; name: string; value: number; label: string }[]
  onSelect?: (id: string) => void
  icon?: React.ComponentType<{ size?: number; className?: string }>
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{columns[0]}</span>
        <span>{columns[1]}</span>
      </div>
      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onSelect?.(r.id)}
          className="group flex items-center gap-3 rounded text-left"
        >
          <div className="min-w-0 flex-1">
            <div
              className="flex h-[22px] items-center gap-2 rounded bg-[var(--chart-bar)] px-2.5"
              style={{ width: `${Math.max((r.value / max) * 100, 30)}%` }}
            >
              {Icon && <Icon size={14} className="shrink-0 text-foreground" />}
              <span className="truncate text-sm text-foreground group-hover:underline">{r.name}</span>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-foreground">{r.label}</span>
        </button>
      ))}
    </div>
  )
}

// Section heading for management surfaces inside a tab (toolbar + table below).
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// Cost-style pill toggle (bg-muted track, raised active segment).
export function PillToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex w-fit items-center gap-1 rounded bg-muted p-[3px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-2.5 py-1 text-sm transition-colors",
            value === o.value
              ? "bg-background font-semibold text-foreground shadow-[var(--shadow-db-sm)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function UserCell({ name }: { name: string }) {
  return <span className="truncate text-foreground">{name}</span>
}

// Status always carries an icon + label, never color alone.
export function StatusCell({ status, detail }: { status: SourceStatus; detail?: string }) {
  const label = (
    <span className="flex items-center gap-1.5">
      {status === "Healthy" && <CheckCircleIcon size={14} className="text-[var(--success)]" />}
      {status === "Syncing" && <SyncIcon size={14} className="animate-spin text-primary [animation-duration:2s]" />}
      {status === "Needs attention" && <WarningIcon size={14} className="text-[var(--warning)]" />}
      {status === "Not connected" && <span className="size-3.5 rounded-full border-[1.5px] border-muted-foreground/50" aria-hidden="true" />}
      <span className={cn(status === "Not connected" && "text-muted-foreground", detail && "cursor-default")}>{status}</span>
    </span>
  )
  // Detail (e.g. why it needs attention) lives in a tooltip to keep rows one line.
  if (!detail) return label
  return (
    <Tooltip>
      <TooltipTrigger asChild>{label}</TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  )
}
